import { Maybe } from "common/fp/option";
import {Try, TryCatch} from "common/fp/try";

import {FlatmatesListingsRequest, PropertyType, RoomType, Search} from "./map_markers_request";
import {BoundingBox} from "../geo";
import {HTTPClient, Headers} from "../http_client";

import fetch, { Request, Response } from "node-fetch"

import {FetchHTTPClient} from "../fetch_http_client";

export class FlatmatesClient {

  constructor(
    private readonly httpClient: HTTPClient,
    private sessionId: string,
    private sessionToken: string,
  ) {}

  private static readonly baseUrl: string = "https://flatmates.com.au";
  private static _client: FlatmatesClient | null = null;

  static async create(): Promise<FlatmatesClient>
  {
    if (this._client != null) {
        console.log("Returning cached client.");
        return Promise.resolve(this._client);
    } else {

      console.log("1");

      let httpClient: HTTPClient = new FetchHTTPClient(1000, 3, 2000, true);
      const resp = await httpClient.get(FlatmatesClient.baseUrl);
      const html: string = await resp.text();

      // Trigger potential exceptions since they will cause the promise to be rejected.
      const sessionId: string = FlatmatesClient.parseSessionId(resp).get();
      const sessionToken: string = FlatmatesClient.parseSessionToken(html).get();

      console.log("2");

      // Cache flatmates API client for global process use.
      this._client = new FlatmatesClient(httpClient, sessionId, sessionToken);
      return this._client;
    }
  }

  static async flatmatesListings({
    boundingBox,
    room,
    propertyTypes,
    minBudget,
    maxBudget,
  }: {
    boundingBox: BoundingBox
    room?: RoomType,
    propertyTypes?: Array<PropertyType>,
    minBudget?: number,
    maxBudget?: number,
  }): Promise<Response> {
    console.log("3");
    return FlatmatesClient
      .create()
      .then( flatmatesClient => {
        let reqBody = FlatmatesClient.buildListingsRequest({
          boundingBox,
          room,
          propertyTypes,
          minBudget,
          maxBudget,
        });

        let request = new Request(this.baseUrl + "/map_markers",
          {
            method: "POST",
            headers: {
              "Accept":"application/json",
              "Accept-Encoding": "gzip, deflate, br",
              "Content-Type": "application/json;charset=UTF-8",
              "Cookie": flatmatesClient.sessionId,
              "X-CSRF-Token": flatmatesClient.sessionToken
            },
            body: JSON.stringify(reqBody)
          }
        );

        console.log("4");
        return fetch(request);
        // setup HTTP client with retires etc
      });
  }

  // POST /map_markers HTTP/1.1
  // Host: flatmates.com.au
  // Connection: keep-alive
  // Content-Length: 205
  // Accept: application/json
  // X-NewRelic-ID: VQUHUFdAAAQHUVNVBwQ=
  //   Origin: https://flatmates.com.au
  //   X-CSRF-Token: ziq/JYoGwWSzWE9zHuJLycsRG3fAZoXrMxrs7Mv7n5wgULrT7IWZejxlYEjcEubybveWLITeX41rzqhn88fhOw==
  // User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36
  // Content-Type: application/json;charset=UTF-8
  // Referer: https://flatmates.com.au/rooms/wolli-creek-2205/max-1000+private-room?search_source=search_function
  // Accept-Encoding: gzip, deflate, br
  // Accept-Language: en-GB,en-US;q=0.9,en;q=0.8
  // Cookie: _session=Ijd0cTVIS3dZeUVMc0ZNck04aWo1YmloZiI%3D--069ff4a4d60fe57a17402056e88f431e6ec28a6c; _flatmates_session=ae4954dc7860614ac29a472c7594c802; __stripe_mid=37c7e53b-4022-4ac9-a4ab-82455d346c3c; _ga=GA1.3.532878047.1559367900; _fbp=fb.2.1559367900359.1296149440; __stripe_sid=b1b15c1f-9ce2-488f-80d2-d54f0e129897; _gid=GA1.3.1499748352.1559657847; _gat=1
  //
  //
  // curl 'https://flatmates.com.au/map_markers' \
  //   -H 'X-NewRelic-ID: VQUHUFdAAAQHUVNVBwQ=' \
  //   -H 'Origin: https://flatmates.com.au' \
  //   -H 'Accept-Encoding: gzip, deflate, br' \
  //   -H 'X-CSRF-Token: ziq/JYoGwWSzWE9zHuJLycsRG3fAZoXrMxrs7Mv7n5wgULrT7IWZejxlYEjcEubybveWLITeX41rzqhn88fhOw==' \
  //   -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8' \
  //   -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36' \
  //   -H 'Content-Type: application/json;charset=UTF-8' \
  //   -H 'Accept: application/json' \
  //   -H 'Referer: https://flatmates.com.au/rooms/wolli-creek-2205/max-1000+private-room?search_source=search_function' \
  //   -H 'Cookie: _session=Ijd0cTVIS3dZeUVMc0ZNck04aWo1YmloZiI%3D--069ff4a4d60fe57a17402056e88f431e6ec28a6c; _flatmates_session=ae4954dc7860614ac29a472c7594c802; __stripe_mid=37c7e53b-4022-4ac9-a4ab-82455d346c3c; _ga=GA1.3.532878047.1559367900; _fbp=fb.2.1559367900359.1296149440; __stripe_sid=b1b15c1f-9ce2-488f-80d2-d54f0e129897; _gid=GA1.3.1499748352.1559657847; _gat=1' \
  //   -H 'Connection: keep-alive' \
  //   --data-binary '{"search":{"mode":"rooms","locations":["wolli-creek-2205"],"max_budget":1000,"room":"private-room","top_left":"-33.91680541979749,151.11446096743168","bottom_right":"-33.94315514216812,151.1923952325684"}}' \
  //   --compressed

// {"search":{
//   "mode":"rooms",
//   "locations":["wolli-creek-2205"],
//   "max_budget":1000,
//   "room":"private-room",
//   "top_left":"-33.91680541979749,151.11446096743168",
//   "bottom_right":"-33.94315514216812,151.1923952325684"}
// }'

  /**
   * Perform risky parsing of response header to determine session id for authentication
   * Sample cookie:
   * _session=InVBb0ZRQ05nZlBCNnI3Z1E0SkpncnNQQyI%3D--a29a6b2ea14a26a925da08acf912b82afe307681; path=/; expires=Sun, 09 Dec 2018 06:39:05 -0000; secure, _flatmates_session=8d5efaf0352d09453e11c6879c407774; domain=.flatmates.com.au; path=/; expires=Sun, 16 Sep 2018 06:39:05 -0000; secure; HttpOnly
   *
   * Desired result is this portion of the example above:
   * _flatmates_session=8d5efaf0352d09453e11c6879c407774
   *
   * @param resp HTTP response from Flatmates.com.au homepage
   * @returns The flatmates session id for authentication
   */
  private static parseSessionId(resp: Response): Try<string>
  {
    return TryCatch(() => {
        const cookie: string | null = resp.headers.get("set-cookie");
        // perform risky parsing of cookie in response header
        // @ts-ignore
        const sessionIdMatches = cookie.match("_flatmates_session=[a-zA-Z0-9]+");
        // We expect only one match
        // @ts-ignore
        return sessionIdMatches[0]
    })
  }

  /**
   * Perform risky parsing of the flatmates.com.au homepage for the csrf
   * token used for authentication. Example of target div:
   * <meta name="csrf-token" content="ZquiBuMVNjCl+bGWeMO4GNI+CZMVGIZM0HgPe+3idZkJ315HrPNHQaM44j1mcYqriTS9dfL7+mKX41Y+81Sb5Q==" />
   */
  private static parseSessionToken(html: string): Try<string> {
    return TryCatch( () => {
      const matches = html.match(".*csrf-token.*");
      // @ts-ignore
      const csrfTokenDiv = matches[0];
      const tokenMatches = csrfTokenDiv.match("\"[a-zA-Z0-9|=|+|\\/]+\"");
      // @ts-ignore
      return tokenMatches[0].replace("\"", "");
    });
  }

  private static buildListingsRequest({
    boundingBox,
    room,
    propertyTypes,
    minBudget,
    maxBudget,
  }: {
    boundingBox: BoundingBox
    room?: RoomType,
    propertyTypes?: Array<PropertyType>,
    minBudget?: number,
    maxBudget?: number,
  }) {
    return new FlatmatesListingsRequest(
      new Search(
        "rooms",
        room || null,
        propertyTypes || null,
        minBudget || 0,
        maxBudget || 10_000,
        `${boundingBox.topLeft.lat},${boundingBox.topLeft.lon}`,
        `${boundingBox.bottomRight.lat},${boundingBox.bottomRight.lon}`,
      )
    )
  }
}

//
//
// package com.wadejensen.atlas.flatmates
//
// import com.wadejensen.atlas.flatmates.model.*
//
// import com.wadejensen.atlas.model.Listing
//
// import kotlinx.serialization.json.JSON as Json
//
// import com.wadejensen.atlas.kotlinjs.http.Method
// import org.w3c.fetch.Response
// import com.wadejensen.atlas.kotlinjs.http.Request
// import kotlinjs.http.fetch
// import kotlinx.coroutines.experimental.await
// import org.funktionale.Try
//
//
// data class FlatmatesClient(
//     val sessionId: String,
//     val sessionToken: String,
//     val baseUrl: String) {
//
//     /**
//      * Asyncronously query flatmates.com.au for real estate listings within a geographic bounding box,
//      * filtered by listing type, and price. Handles parsing and translation of raw listing format.
//      *
//      * @param lat1 Latitude coord of bounding box
//      * @param lon1 Longitude coord of bounding box
//      * @param lat2 Latitude coord of bounding box
//      * @param lon2 Longitude coord of bounding box
//      * @param roomType The kind of real estate listing eg. single room, whole property, team up.
//      *        See [[ListingType]] for all possible values.
//      * @param minPrice Lowest rental cost to be returned
//      * @param maxPrice Highest rental cost to be returned
//      */
//     suspend fun getListings(
//         lat1: Double,
//         lon1: Double,
//         lat2: Double,
//         lon2: Double,
//         roomType: RoomType,
//         minPrice: Double,
//         maxPrice: Double): Try<Array<Listing>> {
//
//         // make API request
//         val flatmatesListingsOrErr: Try<Array<FlatmatesListing>> = mapMarkersApi(
//         lat1,
//         lon1,
//         lat2,
//         lon2,
//         roomType,
//         minPrice,
//         maxPrice)
//
//     flatmatesListingsOrErr.map { flatmatesListing -> console.dir(flatmatesListing[0]) }
//
//     return flatmatesListingsOrErr.map { flatmatesListings ->
//         // if results are saturated then break the request down into several requests over a smaller area
//         if (flatmatesListings.size >= 1001) {
//             TODO()
//         }
//         else {
//             flatmatesListings.map {
//                 Listing(
//                     id = it.id.toString(),
//                     lat = it.latitude,
//                     lon = it.longitude,
//                     price = it.rent.average(),
//                     listingType = roomType.value,
//                     listingUrl = it.listing_link,
//                     imageUrl = it.photo,
//                     source = "flatmates",
//                     title = it.head,
//                     subheading = it.subheading,
//                     address = null,
//                     bedrooms = null,
//                     bathrooms = null,
//                     carspaces = null)
//             }.toTypedArray()
//         }
//     }
// }
//
//
//     /**
//      * Raw asyncronous API call for getting pins on a map from flatmates.com.au of all real estate listings within a
//      * geographic bounding box, filtered by listing type, and price.
//      *
//      * @param lat1 Latitude coord of bounding box
//      * @param lon1 Longitude coord of bounding box
//      * @param lat2 Latitude coord of bounding box
//      * @param lon2 Longitude coord of bounding box
//      * @param requestType The kind of real estate listing eg. single room, whole property, team up.
//      *        See [[ListingType]] for all possible values.
//      * @param minPrice Lowest rental cost to be returned
//      * @param maxPrice Highest rental cost to be returned
//      */
// private suspend fun mapMarkersApi(
//         lat1: Double,
//         lon1: Double,
//         lat2: Double,
//         lon2: Double,
//         requestType: RoomType,
//         minPrice: Double,
//         maxPrice: Double): Try<Array<FlatmatesListing>> {
//
//         // construct request body
//         val request = Request(
//             method = Method.POST,
//             headers = mapOf(
//                 "Accept-Encoding" to "gzip, deflate, br",
//         "Content-Type" to "application/json;charset=UTF-8",
//         "Cookie" to this.sessionId,
//         "X-CSRF-Token" to this.sessionToken
// ),
//     body = MapMarkersRequestBody.create(
//         lat1 = lat1,
//         lon1 = lon1,
//         lat2 = lat2,
//         lon2 = lon2,
//         searchMode = SearchMode.NONE,
//         roomType = RoomType.PRIVATE_ROOM, // TODO paramterise
//         property_types = null,
//         minPrice = minPrice,
//         maxPrice = maxPrice)
// )
//
//     return Try {
//         // make request
//         val resp = fetch("$baseUrl/map_markers", request).await()
//         if (resp.status != 200.toShort()) {
//             throw RuntimeException("flatmates.com.au mapMarkersApi responded with status code: ${resp.status}")
//         }
//         val data = resp.json().await()
//
//         // parse into typed objects
//         val mapMarkers = JSON.parse<MapMarkersResponseBody>(JSON.stringify(data))
//         mapMarkers.matches
//     }
// }
//
//     /**
//      * Perform an api call to get suburb location and POI autocomplete from flatmates.com.au.
//      * POIs : suburb, city, university, tram_stop, train_station
//      */
//     suspend fun autocomplete(
//         userInput: String,
//         url: String = "${this.baseUrl}/autocomplete"): Try<Array<AutocompleteSuggestion>> {
//
//         // construct request body
//         val request = Request(
//             method = Method.POST,
//             headers = mapOf(
//                 "Content-Type" to "application/json;charset=UTF-8",
//         "Accept" to "application/json",
//         "Accept-Encoding" to "gzip, deflate, br"),
//     body = AutocompleteRequestBody.create(userInput)
// )
//
//     // make request
//     return Try {
//         val resp = fetch(url, request).await()
//         if ( resp.status.toInt() != 200 ) {
//             throw RuntimeException("flatmates.com.au autocomplete API responded with status code: ${resp.status}")
//         }
//         val data = resp.json().await()
//
//         // Parse response into typed object
//         val suggestionsBlob: AutocompleteResponse = JSON.parse<AutocompleteResponse>(JSON.stringify(data))
//
//         // Black magic indexing into JSON response
//         val suggestions = suggestionsBlob
//             .suggest
//             .location_suggest[0]
//             .options
//             .map { it._source }
//
//         // Remove extraneous information
//         suggestions.map {
//             AutocompleteSuggestion(
//                 state = it.state,
//                 city = it.city,
//                 postcode = it.postcode,
//                 suburb = it.suburb,
//                 country = it.country,
//                 latitude = it.latitude,
//                 longitude = it.longitude,
//                 location_type = it.location_type,
//                 radius = it.radius,
//                 search_title = it.search_title,
//                 short_title = it.short_title)
//         }.toTypedArray()
//     }
// }
//
//     companion object {
//
//         const val baseUrl: String = "https://flatmates.com.au"
//
//         /**
//          * Asyncronous constructor of a [[FlatmatesClient]].
//          * @param url The base url of Flatmates.com.au
//          * @returns A FlatmatesClient if [[Success]]ful or a wrapped Throwable value if [[Failure]]
//          */
//         suspend fun create(url: String = baseUrl): Try<FlatmatesClient> {
//             return Try {
//             val resp: Response = fetch(url).await()
//
//             if (resp.status.toInt() != 200) {
//                 throw RuntimeException("Invalid flatmates homepage response code: ${resp.status}")
//             }
//
//             val sessionId = parseSessionId(resp).get()
//             val sessionToken = parseSessionToken(resp).get()
//
//             FlatmatesClient(sessionId, sessionToken, url)
//         }
//     }
//
//         /**
//          * Perform risky parsing of response header to determine session id for authentication
//          * Sample cookie:
//          * _session=InVBb0ZRQ05nZlBCNnI3Z1E0SkpncnNQQyI%3D--a29a6b2ea14a26a925da08acf912b82afe307681; path=/; expires=Sun, 09 Dec 2018 06:39:05 -0000; secure, _flatmates_session=8d5efaf0352d09453e11c6879c407774; domain=.flatmates.com.au; path=/; expires=Sun, 16 Sep 2018 06:39:05 -0000; secure; HttpOnly
//          *
//          * Desired result is this portion of the example above:
//          * _flatmates_session=8d5efaf0352d09453e11c6879c407774
//          *
//          * @param resp HTTP response from Flatmates.com.au homepage
//          * @returns The flatmates session id for authentication
//          */
//     private fun parseSessionId(resp: Response): Try<String> {
//             return Try {
//             val cookie: String? = resp.headers.get("set-cookie")
//
//                 // perform risky parsing of cookie in response header
//                 val sessionIdMatches = cookie
//                 ?.match("_flatmates_session=[a-zA-Z0-9]+")!!
//
//             // Ensure a match exists
//             if (sessionIdMatches.isEmpty()) {
//                 throw NoSuchElementException("Could not parse ")
//             }
//
//             // We expect only one match
//             sessionIdMatches[0]
//         }
//     }
//
//         /**
//          * Perform risky parsing of the Flatmates.com.au homepage for the csrf token used for authentication
//          * Example of target div:
//          * <meta name="csrf-token" content="ZquiBuMVNjCl+bGWeMO4GNI+CZMVGIZM0HgPe+3idZkJ315HrPNHQaM44j1mcYqriTS9dfL7+mKX41Y+81Sb5Q==" />
//          */
//         suspend fun parseSessionToken(resp: Response): Try<String> {
//             return Try {
//             val html = resp.text().await()
//             val csrfTokenDiv = html
//                 .match(".*csrf-token.*")
//                 ?.get(0)
//
//             if (csrfTokenDiv == null) {
//                 throw NoSuchElementException("Could not find pattern '.*csrf-token.*' in flatmates html response.")
//             }
//
//             val tokenMatches = csrfTokenDiv
//                 .match("\"[a-zA-Z0-9|=|+|\\/]+\"")!!
//
//             // Ensure a match exists
//             if (tokenMatches.isEmpty()) {
//                 throw NoSuchElementException("Token regex pattern did not match div $csrfTokenDiv")
//             }
//             // We expect only one match
//             tokenMatches[0].replace("\"", "")
//         }
//     }
//     }
// }
