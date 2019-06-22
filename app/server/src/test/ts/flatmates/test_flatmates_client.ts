import {FlatmatesClient} from "../../../main/ts/flatmates/flatmates_client";
import {Try} from "../../../../../common/src/main/ts/fp/try";
import {Coord, Geo} from "../../../main/ts/geo";
import {
  FlatmatesListingsRequest,
  RoomType,
  Search
} from "../../../main/ts/flatmates/flatmates_listings_request";
import nock from "nock";
import {FetchHTTPClient} from "../../../main/ts/fetch_http_client";
import {
  FlatmatesListing,
  MapMarkersResponse
} from "../../../main/ts/flatmates/map_markers_response";

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
      expect(client).toStrictEqual(expected);
    } catch (e) {
      console.error(e);
      fail();
    }
  });

  test("flatmatesListing returns a list of available rental room listings", async () => {
    const flatmatesClient = new FlatmatesClient(
      new FetchHTTPClient(1000, 3, 300, true),
      "dummy_session_id",
      "dummy_session_token",
    );

    const reqBody = new FlatmatesListingsRequest(
      new Search(
        "rooms",
        "private-room",
        null,
        10,
        500,
        "-33.874322,151.194749",
        "-33.883343,151.209044"
      )
    );

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

    const expected = new MapMarkersResponse({
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
      const resp: MapMarkersResponse = await flatmatesClient.flatmatesListings(reqBody);
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

  test("buildListingsRequest creates the correct FlatmatesListingsRequest", () => {
    const reqBody = FlatmatesClient.buildListingsRequest({
      boundingBox: Geo.boundingBox(
        new Coord(-33.874322, 151.194749),
        new Coord(-33.883343, 151.209044)
      ),
      roomType: RoomType.PRIVATE_ROOM,
      minBudget: 10,
      maxBudget: 500,
    });
    const expected = new FlatmatesListingsRequest(
      new Search(
        "rooms",
        "private-room",
        null,
        10,
        500,
        "-33.874322,151.194749",
        "-33.883343,151.209044"
      )
    );
    expect(reqBody).toStrictEqual(expected);
  });
});
