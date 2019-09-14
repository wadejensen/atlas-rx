import {FlatmatesClient} from "../../../main/ts/flatmates/flatmates_client";
import {Try} from "../../../../../common/src/main/ts/fp/try";

import {
  AutocompleteResponse,
  AutocompleteResult
} from "../../../../../common/src/main/ts/flatmates/autocomplete_result";
import {
  FlatmatesListingsRequest,
  ListingsRequest, mapListingsRequest,
  RoomType, Search
} from "../../../../../common/src/main/ts/flatmates/listings_request";
import {Coord, Geo} from "../../../../../common/src/main/ts/geo";
import {
  FlatmatesListing,
  FlatmatesListingsResponse
} from "../../../../../common/src/main/ts/flatmates/listings_response";
import {
  AutocompleteRequest,
  Completion, Contexts, Fuzzy, LocationSuggest
} from "../../../../../common/src/main/ts/flatmates/autocomplete_request";
import {FetchHTTPClient} from "../../../main/ts/http/fetch_http_client";


const nock = require("nock");

describe("FlatmatesClient", () => {
  test("create factory method correctly creates a FlatmatesClient", async () => {
    const html = `
<html lang='en'>
  <meta name="csrf-token" content="ZquiBuMVNjCl+bGWeMO4GNI+CZMVGIZM0HgPe+3idZkJ315HrPNHQaM44j1mcYqriTS9dfL7+mKX41Y+81Sb5Q==" />
</html>
`;
    const cookie = "_session=Im5LUldpRHlBa0hkZFk3Sm43RkF3NWpZeCI%3D--1b6437fc7e771a64b5659c62af10874778ebe8a9; path=/; expires=Mon, 16 Sep 2019 03:24:50 -0000; secure, _flatmates_session=797cd4cd931067289667a116e6ce3f4d; domain=.flatmates.com.au; path=/; expires=Sun, 23 Jun 2019 03:24:50 -0000; secure; HttpOnly"

    // mock network call
    const scope = nock("https://flatmates.com.au")
      .get("/")
      .reply(200, html, { ['set-cookie']: cookie });

    try {
      const client = await FlatmatesClient.create();

      const expected = new FlatmatesClient(
        new FetchHTTPClient(1000, 3, 300, true),
        "_flatmates_session=797cd4cd931067289667a116e6ce3f4d",
        "ZquiBuMVNjCl+bGWeMO4GNI+CZMVGIZM0HgPe+3idZkJ315HrPNHQaM44j1mcYqriTS9dfL7+mKX41Y+81Sb5Q==",
      );
      expect(client.equals(expected)).toBeTruthy();
    } catch (e) {
      console.error(e);
      fail();
    }
  });

  test("autocomplete returns a list of typeahead autocomplete POI suggestions", async () => {
    const flatmatesClient = new FlatmatesClient(
      new FetchHTTPClient(1000, 3, 300, true),
      "dummy_session_id",
      "dummy_session_token",
    );

    const req = FlatmatesClient.buildAutocompleteRequest("redfer");

    const scope = nock("https://flatmates.com.au")
      .post("/autocomplete", JSON.stringify(req), { reqheaders:
          {
            ["accept"]: "application/json",
            ["accept-encoding"]: "gzip, deflate, br",
            ["content-type"]: "application/json;charset=utf-8",
            ["user-agent"]: "",
            ["content-length"]: "197",
            ["connection"]: "close",
          }
      })
      .reply(200, {
        "took": 1,
        "timed_out": false,
        "_shards": {
          "total": 5,
          "successful": 5,
          "failed": 0
        },
        "hits": {
          "total": 0,
          "max_score": 0.0,
          "hits": []
        },
        "suggest": {
          "location_suggest": [
            {
              "text": "redf",
              "offset": 0,
              "length": 4,
              "options": [
                {
                  "text": "Redfern",
                  "_index": "locations_production_20170321151001639",
                  "_type": "location",
                  "_id": "287",
                  "_score": 1908.0,
                  "_source": {
                    "id": 287,
                    "state": "NSW",
                    "city": "Sydney",
                    "suburb": "Redfern",
                    "postcode": "2016",
                    "country": "AU",
                    "created_at": "2014-12-29T14:53:38.219Z",
                    "updated_at": "2019-06-15T14:42:54.371Z",
                    "latitude": -33.892963,
                    "longitude": 151.2053979,
                    "polygon": [],
                    "location_type": "suburb",
                    "key": "redfern-2016",
                    "average_rent": 327,
                    "temp_latitude": null,
                    "temp_longitude": null,
                    "radius": 6,
                    "name": null,
                    "short_name": null,
                    "synonyms": [],
                    "location": [151.2053979, -33.892963],
                    "search_title": "Redfern, Sydney, NSW, 2016",
                    "short_title": "Redfern, 2016",
                    "suggest": {
                      "input": ["Sydney", "2016", "Redfern", "Redfern 2016", "Redfern NSW"],
                      "weight": 477,
                      "contexts": {
                        "location_type": ["suburb"]
                      }
                    }
                  },
                  "contexts": {
                    "location_type": ["suburb"]
                  }
                },
                {
                  "text": "Red Hill",
                  "_index": "locations_production_20170321151001639",
                  "_type": "location",
                  "_id": "8019",
                  "_score": 720.0,
                  "_source": {
                    "id": 8019,
                    "state": "QLD",
                    "city": "Brisbane",
                    "suburb": "Red Hill",
                    "postcode": "4059",
                    "country": "AU",
                    "created_at": "2014-12-29T14:53:53.385Z",
                    "updated_at": "2019-06-22T15:15:56.694Z",
                    "latitude": -27.451,
                    "longitude": 153.004,
                    "polygon": [],
                    "location_type": "suburb",
                    "key": "red-hill-4059",
                    "average_rent": 200,
                    "temp_latitude": null,
                    "temp_longitude": null,
                    "radius": 5,
                    "name": null,
                    "short_name": null,
                    "synonyms": [],
                    "location": [153.004, -27.451],
                    "search_title": "Red Hill, Brisbane, QLD, 4059",
                    "short_title": "Red Hill, 4059",
                    "suggest": {
                      "input": ["Brisbane", "4059", "Red Hill", "Red Hill 4059", "Red Hill QLD"],
                      "weight": 180,
                      "contexts": {
                        "location_type": ["suburb"]
                      }
                    }
                  },
                  "contexts": {
                    "location_type": ["suburb"]
                  }
                }
              ]
            }
          ]
        }
      });

    const expected = new AutocompleteResponse("redf", [
      new AutocompleteResult({
        text: "Redfern",
        state: "NSW",
        city: "Sydney",
        suburb: "Redfern",
        postcode: "2016",
        country: "AU",
        latitude: -33.892963,
        longitude: 151.2053979,
        location_type: "suburb",
        average_rent: 327,
        name: null,
        short_name: null,
        search_title: "Redfern, Sydney, NSW, 2016",
        short_title: "Redfern, 2016",
      }),
      new AutocompleteResult({
        text: "Red Hill",
        state: "QLD",
        city: "Brisbane",
        suburb: "Red Hill",
        postcode: "4059",
        country: "AU",
        latitude: -27.451,
        longitude: 153.004,
        location_type: "suburb",
        average_rent: 200,
        name: null,
        short_name: null,
        search_title: "Red Hill, Brisbane, QLD, 4059",
        short_title: "Red Hill, 4059",

      }),
    ]);
    try {
      const resp: AutocompleteResponse = await flatmatesClient.autocomplete(req);
      expect(resp).toStrictEqual(expected);
    } catch (e) {
      console.error(e);
      fail();
    }
  });

  test("doGetFlatmatesListing returns a list of available rental room listings", async () => {
    const flatmatesClient = new FlatmatesClient(
      new FetchHTTPClient(1000, 3, 300, true),
      "dummy_session_id",
      "dummy_session_token",
    );

    const req = new ListingsRequest({
      boundingBox: Geo.boundingBox(
        new Coord(-33.874322, 151.194749),
        new Coord(-33.883343, 151.209044)
      ),
      roomType: RoomType.PRIVATE_ROOM,
      propertyTypes: null,
      minBudget: 10,
      maxBudget: 500,
    });

    const reqBody = mapListingsRequest(req);

    // mock network calls to flatmates
    const scope = nock("https://flatmates.com.au")
      .post("/map_markers", JSON.stringify(reqBody), { reqheaders:
        {
          ["accept"]: "application/json",
          ["accept-encoding"]: "gzip, deflate, br",
          ["content-type"]: "application/json;charset=utf-8",
          ["cookie"]: "dummy_session_id",
          ["user-agent"]: "",
          ["content-length"]: "178",
          ["connection"]: "close",
          ["x-csrf-token"]: "dummy_session_token",
        }
      })
      .reply(200, {
        'matches': [
          {
            head: 'Sydney, Sydney',
            subheading: 'Furnished room with own bathroom',
            photo:
              'https://flatmates-res.cloudinary.com/image/upload/c_fill,dpr_2.0,f_auto,h_180,q_auto,w_290/jlgvhkkidzntxxcqxd1h.jpg',
            listing_link: '/share-house-sydney-2000-P847468',
            latitude: -33.8768022,
            longitude: 151.2051179,
            rent: [ 460 ],
            id: 837438,
            type: 'property'
          }
        ],
        'non_matches': [],
      });

    const expected = new FlatmatesListingsResponse({
      matches: [new FlatmatesListing({
        head: 'Sydney, Sydney',
        subheading: 'Furnished room with own bathroom',
        photo:
          'https://flatmates-res.cloudinary.com/image/upload/c_fill,dpr_2.0,f_auto,h_180,q_auto,w_290/jlgvhkkidzntxxcqxd1h.jpg',
        listing_link: '/share-house-sydney-2000-P847468',
        latitude: -33.8768022,
        longitude: 151.2051179,
        rent: [ 460 ],
        id: 837438,
        type: 'property',
      })],
      non_matches: [],
    });

    try {
      // dynamically retrieve private method
      let doGetFlatmatesListings = (flatmatesClient as any).doGetFlatmatesListings
      const resp: FlatmatesListingsResponse = await doGetFlatmatesListings(req);
      expect(resp).toStrictEqual(expected);
    } catch (e) {
      console.error(e);
      fail();
    }
  });

  test("parseSessionId reads set-cookie header to determine session id", () => {
    // acquire private method reference
    let parseSessionId = (FlatmatesClient as any).parseSessionId;
    const cookie = "_session=Im5LUldpRHlBa0hkZFk3Sm43RkF3NWpZeCI%3D--1b6437fc7e771a64b5659c62af10874778ebe8a9; path=/; expires=Mon, 16 Sep 2019 03:24:50 -0000; secure, _flatmates_session=797cd4cd931067289667a116e6ce3f4d; domain=.flatmates.com.au; path=/; expires=Sun, 23 Jun 2019 03:24:50 -0000; secure; HttpOnly"
    let sessionId: Try<string> = parseSessionId(cookie);
    expect(sessionId.get()).toBe("_flatmates_session=797cd4cd931067289667a116e6ce3f4d")
  });

  test("parseSessionToken reads html document to determine session csrf token", () => {
    // acquire private method reference
    let parseSessionToken = (FlatmatesClient as any).parseSessionToken;
    const html = `
<html lang='en'>
  <meta name="csrf-token" content="ZquiBuMVNjCl+bGWeMO4GNI+CZMVGIZM0HgPe+3idZkJ315HrPNHQaM44j1mcYqriTS9dfL7+mKX41Y+81Sb5Q==" />
</html>    
`;
    let sessionToken: Try<string> = parseSessionToken(html);
    expect(sessionToken.get()).toBe("ZquiBuMVNjCl+bGWeMO4GNI+CZMVGIZM0HgPe+3idZkJ315HrPNHQaM44j1mcYqriTS9dfL7+mKX41Y+81Sb5Q==")
  });

  test("mapListingsRequest creates the correct FlatmatesListingsRequest", () => {
    const req = new ListingsRequest({
      boundingBox: Geo.boundingBox(
        new Coord(-33.874322, 151.194749),
        new Coord(-33.883343, 151.209044)
      ),
      roomType: RoomType.PRIVATE_ROOM,
      minBudget: 10,
      maxBudget: 500,
    });
    const flatmatesReq = mapListingsRequest(req);
    const expected = new FlatmatesListingsRequest({
      mode: "rooms",
      room: "private-room",
      min_budget: 10,
      max_budget: 500,
      top_left: "-33.874322,151.194749",
      bottom_right: "-33.883343,151.209044",
    } as any);

    expect(flatmatesReq).toStrictEqual(expected);
  });

  test("buildAutocompleteRequest creates the correct AutocompleteRequest", () => {
    const req = FlatmatesClient.buildAutocompleteRequest("redfer");
    const expected = new AutocompleteRequest(
      new LocationSuggest(
        "redfer",
        new Completion(
          "suggest",
          5,
          new Fuzzy("AUTO"),
          new Contexts(["suburb", "city", "university", "tram_stop", "train_station"]),
        )
      )
    );
    expect(req).toStrictEqual(expected);
  });
});
