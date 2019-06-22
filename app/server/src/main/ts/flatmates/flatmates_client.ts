import {Try, TryCatch} from "common/fp/try";
import Cheerio from "cheerio"
import {BoundingBox} from "../geo";
import {HTTPClient} from "../http_client";
import {Request} from "node-fetch"

import {FetchHTTPClient} from "../fetch_http_client";
import {AutocompleteResult} from "./autocomplete_result";
import {ListingsRequest, PropertyType, RoomType, Search} from "./listings_request";
import {
  AutocompleteRequest,
  Completion,
  Contexts,
  Fuzzy,
  LocationSuggest
} from "./autocomplete_request";
import {FlatmatesListing, ListingsResponse} from "./listings_response";

export class FlatmatesClient {
  private static readonly BASE_URL: string = "https://flatmates.com.au";

  constructor(
    private readonly httpClient: HTTPClient,
    private sessionId: string,
    private sessionToken: string,
  ) {}

  /**
   * Factory method for a {@link FlatmatesClient}
   */
  static async create(): Promise<FlatmatesClient> {
    let httpClient: HTTPClient = new FetchHTTPClient(1000, 3, 300, true);
    let resp = await httpClient.get(FlatmatesClient.BASE_URL);
    let html: string = await resp.text();

    // Trigger potential exceptions since they will cause the promise to be rejected.
    let cookie = resp.headers.get("set-cookie");
    let sessionId: string = this.parseSessionId(cookie).get();
    let sessionToken: string = this.parseSessionToken(html).get();

    return new FlatmatesClient(httpClient, sessionId, sessionToken);
  }

  async autocomplete(req: AutocompleteRequest): Promise<Array<AutocompleteResult>> {
    let request = new Request(FlatmatesClient.BASE_URL + "/autocomplete",
      {
        "method": "POST",
        headers: {
          "accept": "application/json",
          "accept-encoding": "gzip, deflate, br",
          "content-type": "application/json;charset=UTF-8",
          "user-agent": "",
        },
        body: JSON.stringify(req), // "{\"location_suggest\":{\"text\":\"redfern station\",\"completion\":{\"field\":\"suggest\",\"size\":5,\"fuzzy\":{\"fuzziness\":\"AUTO\"},\"contexts\":{\"location_type\":[\"suburb\",\"city\",\"university\",\"tram_stop\",\"train_station\"]}}}}", //
      });

    let json = await this.httpClient
      .dispatch(request)
      .then(r => r.json());

    return FlatmatesClient.parseAutocompleteResponse(json).get();
  }

  /**
   * List residential rooms for rent on flatmates.com.au
   * //TODO(wadejensen) handle API paging
   */
  async flatmatesListings(req: ListingsRequest): Promise<ListingsResponse> {
    let request = new Request(FlatmatesClient.BASE_URL + "/map_markers",
      {
        method: "POST",
        headers: {
          "accept":"application/json",
          "accept-encoding": "gzip, deflate, br",
          "content-type": "application/json;charset=UTF-8",
          "cookie": this.sessionId,
          "user-agent": "",
          "x-csrf-token": this.sessionToken,
        },
        body: JSON.stringify(req)
      }
    );

    let json: any = await this.httpClient
      .dispatch(request)
      .then(r => r.json());

    return FlatmatesClient.parseListingsResponse(json).get();
  }

  static buildListingsRequest({
    boundingBox,
    roomType,
    propertyTypes,
    minBudget,
    maxBudget,
  }: {
    boundingBox: BoundingBox
    roomType?: RoomType,
    propertyTypes?: Array<PropertyType>,
    minBudget?: number,
    maxBudget?: number,
  }) {
    return new ListingsRequest(
      new Search(
        "rooms",
        roomType || null,
        propertyTypes || null,
        minBudget || 0,
        maxBudget || 10_000,
        `${boundingBox.topLeft.lat},${boundingBox.topLeft.lon}`,
        `${boundingBox.bottomRight.lat},${boundingBox.bottomRight.lon}`,
      )
    )
  }

  /**
   * Attempt to parse map_markers response json into a ListingsResponse
   */
  private static parseListingsResponse(obj: any): Try<ListingsResponse> {
    return TryCatch( () => {
      let matches: Array<any> = obj["matches"];
      let nonMatches: Array<any> = obj["non_matches"];

      return new ListingsResponse({
        matches: matches.map(json => new FlatmatesListing({...json})),
        non_matches: nonMatches.map(json => new FlatmatesListing({...json})),
      });
    });
  }

  static buildAutocompleteRequest(query: string): AutocompleteRequest {
    return new AutocompleteRequest(
      new LocationSuggest(
        query,
        new Completion(
          "suggest",
          5,
          new Fuzzy("AUTO"),
          new Contexts(["suburb", "city", "university", "tram_stop", "train_station"]),
        )
      )
    );
  }

  private static parseAutocompleteResponse(obj: any): Try<Array<AutocompleteResult>> {
    return TryCatch( () => {
      const locationSuggest = obj["suggest"]["location_suggest"];
      return locationSuggest.map((json: any) => {
        const options = json["options"][0];
        const source = options["_source"];

        return new AutocompleteResult({
          query: locationSuggest["text"],
          text: options["text"],
          state: source["state"],
          city: source["city"],
          suburb: source["suburb"],
          postcode: source["postcode"],
          country: source["country"],
          latitude: source["latitude"],
          longitude: source["longitude"],
          location_type: source["location_type"],
          average_rent: source["average_rent"],
          name: source["name"],
          short_name: source["short_name"],
          search_title: source["search_title"],
          short_title: source["short_title"],
        })
      });
    });

    let x = {
      "took":1,
      "timed_out":false,
      "_shards":{
        "total":5,
        "successful":5,
        "failed":0
      },
      "hits":{
        "total":0,
        "max_score":0.0,
        "hits":[]
      },
      "suggest":{
        "location_suggest":[
          {"text":"redfern station",
            "offset":0,
            "length":15,
            "options":[
              {
                "text":"Redfern Station",
                "_index":"locations_production_20170321151001639",
                "_type":"location",
                "_id":"19306",
                "_score":15.0,
                "_source":{
                  "id":19306,
                  "state":"NSW",
                  "city":"Sydney",
                  "suburb":"Eveleigh",
                  "postcode":"2015",
                  "country":"AU",
                  "created_at": "2017-03-15T09:33:11.159Z",
                  "updated_at":"2019-06-15T14:55:42.607Z",
                  "latitude":-33.8916355,
                  "longitude":151.1987696,
                  "polygon":[],
                  "location_type":"train_station",
                  "key":"redfern-station-sydney",
                  "average_rent":328,
                  "temp_latitude":null,
                  "temp_longitude":null,
                  "radius":5,
                  "name":"Redfern Station",
                  "short_name":null,
                  "synonyms":[],
                  "location":[151.1987696,-33.8916355],
                  "search_title":"Redfern Station, Sydney, NSW, 2015",
                  "short_title":"Redfern Station",
                  "suggest":{
                    "input":[
                      "Sydney",
                      "2015",
                      "Redfern Station"
                    ],
                    "weight":0,
                    "contexts":{
                      "location_type":["train_station"]
                    }
                  }
                },
                "contexts":{
                  "location_type":["train_station"]
                }
              }
            ]
          }
        ]
      }
    }
  }

  /**
   * Perform risky parsing of response header to determine session id for authentication
   * Sample cookie:
   * _session=InVBb0ZRQ05nZlBCNnI3Z1E0SkpncnNQQyI%3D--a29a6b2ea14a26a925da08acf912b82afe307681; path=/; expires=Sun, 09 Dec 2018 06:39:05 -0000; secure, _flatmates_session=8d5efaf0352d09453e11c6879c407774; domain=.flatmates.com.au; path=/; expires=Sun, 16 Sep 2018 06:39:05 -0000; secure; HttpOnly
   *
   * Desired result is this portion of the example above:
   * _flatmates_session=8d5efaf0352d09453e11c6879c407774
   *
   * @param cookie The "set-cookie" header in the HTTP response from
   * Flatmates.com.au homepage
   * @returns The flatmates session id for authentication
   */
  private static parseSessionId(cookie: string | null): Try<string> {
    return TryCatch(() => {
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
   * token used for authentication.
   *
   * Example of target div:
   * <meta name="csrf-token" content="ZquiBuMVNjCl+bGWeMO4GNI+CZMVGIZM0HgPe+3idZkJ315HrPNHQaM44j1mcYqriTS9dfL7+mKX41Y+81Sb5Q==" />
   * returns the content attribute:   ZquiBuMVNjCl+bGWeMO4GNI+CZMVGIZM0HgPe+3idZkJ315HrPNHQaM44j1mcYqriTS9dfL7+mKX41Y+81Sb5Q==
   */
  private static parseSessionToken(html: string): Try<string> {
    return TryCatch( () => {
      // jQuery API reimplemented for Node
      const document = Cheerio.load(html);
      return document("[name='csrf-token']").attr("content");
    });
  }
}

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
