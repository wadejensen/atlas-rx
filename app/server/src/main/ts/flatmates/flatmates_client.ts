import {Try, TryCatch} from "../../../../../common/src/main/ts/fp/try";
import {Request} from "node-fetch"

import * as Cheerio from "cheerio";

import {HTTPClient} from "../http/http_client";
import {
  AutocompleteRequest, Completion, Contexts, Fuzzy,
  LocationSuggest
} from "../../../../../common/src/main/ts/flatmates/autocomplete_request";
import {
  FlatmatesListing,
  ListingsResponse
} from "../../../../../common/src/main/ts/flatmates/listings_response";
import {BoundingBox, Geo} from "../../../../../common/src/main/ts/geo";
import {setMerge} from "../../../../../common/src/main/ts/set_util";
import {RateLimitedHTTPClient} from "../http/rate_limited_http_client";
import {
  AutocompleteResponse,
  AutocompleteResult
} from "../../../../../common/src/main/ts/flatmates/autocomplete_result";
import {
  ListingsRequest,
  ListingsRequestBuilder, mapListingsRequest
} from "../../../../../common/src/main/ts/flatmates/listings_request";

export class FlatmatesClient {
  private static readonly BASE_URL: string = "https://flatmates.com.au";
  private static readonly LISTINGS_RESP_LIMIT = 200;

  constructor(
    private readonly httpClient: HTTPClient,
    private sessionId: string,
    private sessionToken: string,
  ) {}

  equals(other: FlatmatesClient): boolean {
    return this.sessionToken === other.sessionToken &&
      this.sessionId === other.sessionId
  }

  /**
   * Factory method for a {@link FlatmatesClient}
   */
  static async create(): Promise<FlatmatesClient> {
    let httpClient: HTTPClient = RateLimitedHTTPClient.create({
      requestTimeoutMs: 3000,
      maxRetries: 3,
      backoffDelay: 300,
      exponentialBackoff: true,
      maxReqPerSec: 3,
    });
    let resp = await httpClient.get(FlatmatesClient.BASE_URL);
    let html: string = await resp.text();

    // Trigger potential exceptions since they will cause the promise to be rejected.
    let cookie = resp.headers.get("set-cookie");
    let sessionId: string = this.parseSessionId(cookie).get();
    let sessionToken: string = this.parseSessionToken(html).get();

    return new FlatmatesClient(httpClient, sessionId, sessionToken);
  }

  /**
   * Perform an api call to get suburb location and POI autocomplete from flatmates.com.au.
   * POIs include: suburb, city, university, tram_stop, train_station.
   */
  async autocomplete(req: AutocompleteRequest): Promise<AutocompleteResponse> {
    let request = new Request(FlatmatesClient.BASE_URL + "/autocomplete",
      {
        "method": "POST",
        headers: {
          "accept": "application/json",
          "accept-encoding": "gzip, deflate, br",
          "content-type": "application/json;charset=UTF-8",
          "user-agent": "",
        },
        body: JSON.stringify(req),
      });

    let json = await this.httpClient
      .dispatch(request)
      .then(r => r.json());

    return FlatmatesClient.parseAutocompleteResponse(json).get();
  }

  /**
   * List residential rooms for rent on flatmates.com.au
   */
  getFlatmatesListings: (req: ListingsRequest, i: number) => Promise<Set<FlatmatesListing>> =
    async (req: ListingsRequest, i: number) => {
      // prevent accidental DDoS of flatmates
      if (i > 10) {
        console.warn("getFlatmatesListings method reached recusion depth of 10");
        return new Set();
      }
      const resp = await this.doGetFlatmatesListings(req);
      if (resp.matches.length + resp.non_matches.length < FlatmatesClient.LISTINGS_RESP_LIMIT) {
        return new Set(resp.matches);
      } else {
        // Request has likely saturated the 200 listing request limit.
        // Divide and conquer.
        const quadrants = Geo.quadrants(req.boundingBox);
        const [req1, req2, req3, req4] = quadrants.map((quad: BoundingBox) => {
          return ListingsRequestBuilder
            .builder(req)
            .withBoundingBox(quad)
            .build()
        });

        // recursively query quadrants
        const quadrantListings: Array<Set<FlatmatesListing>> = await Promise.all([
          this.getFlatmatesListings(req1, i + 1),
          this.getFlatmatesListings(req2, i + 1),
          this.getFlatmatesListings(req3, i + 1),
          this.getFlatmatesListings(req4, i + 1),
        ]);
        return quadrantListings.reduce(setMerge);
      }
  };

  private doGetFlatmatesListings: (req: ListingsRequest) => Promise<ListingsResponse> =
    async (req: ListingsRequest) => {
      const flatmatesReq = mapListingsRequest(req);
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
          body: JSON.stringify(flatmatesReq),
        }
      );

      // delay each request by 300ms to be a good citizen
      // log the rate and kill the server if it exceeds 1rps
      let json = await this.httpClient
          .dispatch(request)
          .then(r => r.json());
      return FlatmatesClient.parseListingsResponse(json).get();
  };

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

  private static parseAutocompleteResponse(obj: any): Try<AutocompleteResponse> {
    return TryCatch(() => {
      const locationSuggest = obj["suggest"]["location_suggest"][0];
      const options = locationSuggest["options"];
      const results = options.map((json: any) => {
        const source = json["_source"];

        return new AutocompleteResult({
          text: json["text"],
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
        });
      });
      return new AutocompleteResponse(locationSuggest["text"], results);
    });
  };

  /**
   * Perform risky parsing of response header to determine session id for authentication
   * Sample cookie:
   * _session=InVBb0ZRQ05nZlBCNnI3Z1E0SkpncnNQQyI%3D--a29a6b2ea14a26a925da08acf912b82afe307681; path=/; expires=Sun, 09 Dec 2018 06:39:05 -0000; secure, _flatmates_session=8d5efaf0352d09453e11c6879c407774; domain=.flatmates.com.au; path=/; expires=Sun, 16 Sep 2018 06:39:05 -0000; secure; HttpOnly
   *
   * Desired result is this portion of the example above:
   * _flatmates_session=8d5efaf0352d09453e11c6879c407774
   *
   * @param cookie The "set-cookie" header in the HTTP response from
   * flatmates.com.au homepage
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
