//@ts-ignore
import nock from "nock";

import fetch from "node-fetch";
import {FetchHTTPClient} from "../../main/ts/fetch_http_client";

describe("FetchHTTPClient", () => {
  test("constructor asserts max retries <= 1000", () => {
    try {
      let httpClient = new FetchHTTPClient(1000, 1001, 0, false);
    } catch (e) {
      expect(e.message).toBe("Max retries must be less than or equal to 1000")
    }
  });

});
//   test("get", async () => {
//     const scope = nock("http://www.example.com")
//       .get("/resource")
//       .reply(200, "fake body");
//
//     let client = new FetchHTTPClient(3000, 0, -1, false);
//     try {
//       let resp = await client.get("http://www.example.com/resource");
//       console.log(resp);
//       console.log("10");
//       let body = await resp.text();
//       expect(body).toBe("fake body")
//     } catch (e) {
//       console.log(e);
//       fail();
//     }
//
//   });
//
//   test("adds 1 + 2 to equal 3", async () => {
//     const scope = nock("http://www.example.com")
//       .get("/resource")
//       .reply(200, "fake body");
//
//     let resp = await fetch("http://www.example.com/resource");
//     let body = await resp.text();
//     expect(body).toBe("fake body")
//   });
// });


test("adds 1 + 2 to equal 3", () => {
  expect(1 + 2).toBe(3);
});
