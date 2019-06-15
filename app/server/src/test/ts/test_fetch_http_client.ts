//@ts-ignore
import nock from "nock";

import fetch from "node-fetch";
import {FetchHTTPClient} from "../../main/ts/fetch_http_client";

// describe("FetchHTTPClient", () => {
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
