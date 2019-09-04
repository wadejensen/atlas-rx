//@ts-ignore
import {FetchHTTPClient} from "../../../main/ts/http/fetch_http_client";

const nock = require("nock");

import fetch, {Request} from "node-fetch";

describe("FetchHTTPClient", () => {

  beforeEach(() => {
    nock.cleanAll();
  });

  test("constructor asserts max retries <= 1000", () => {
    try {
      let httpClient = new FetchHTTPClient(1000, 1001, 0, false);
    } catch (e) {
      expect(e.message).toBe("Max retries must be less than or equal to 1000")
    }
  });

  test("get", async () => {
    const scope = nock("http://www.mock.com")
      .get("/test-endpoint")
      .reply(200, "mock body");

    let httpClient = new FetchHTTPClient(1000, 0, 0, false);

    let resp = httpClient.get("http://www.mock.com/test-endpoint");

    await resp
      .then(res => res.text())
      .then(body => expect(body).toBe("mock body"))
      .catch(msg => fail(msg));
  });

  test("post", async () => {
    const scope = nock("http://www.mock.com")
      .post("/test-endpoint", {name:"John Smith"})
      .reply(201, {name:"Jane Doe"});

    let httpClient = new FetchHTTPClient(1000, 0, 0, false);
    let resp = httpClient.post(
      "http://www.mock.com/test-endpoint",
      {},
      JSON.stringify({name:"John Smith"})
    );

    await resp
      .then(res => res.text())
      .then(body => expect(body).toBe("{\"name\":\"Jane Doe\"}"))
      .catch(msg => fail(msg));
  });

  test("put", async () => {
    const scope = nock("http://www.mock.com")
      .put("/test-endpoint", {name:"John Smith"})
      .reply(201, {name:"Jane Doe"});

    let httpClient = new FetchHTTPClient(1000, 0, 0, false);
    let resp = httpClient.put(
      "http://www.mock.com/test-endpoint",
      {},
      JSON.stringify({name:"John Smith"})
    );

    await resp
      .then(res => res.text())
      .then(body => expect(body).toBe("{\"name\":\"Jane Doe\"}"))
      .catch(msg => fail(msg));
  });

  test("delete", async () => {
    const scope = nock("http://www.mock.com")
      .delete("/test-endpoint", {name:"John Smith"})
      .reply(200, {deleted:"John Smith"});

    let httpClient = new FetchHTTPClient(1000, 0, 0, false);
    let resp = httpClient.delete(
      "http://www.mock.com/test-endpoint",
      {},
      JSON.stringify({name:"John Smith"})
    );

    await resp
      .then(res => res.text())
      .then(body => expect(body).toBe("{\"deleted\":\"John Smith\"}"))
      .catch(msg => fail(msg));
  });

  test("fetchWithDeadline succeeds error when deadline is met", async () => {
    const REQUEST_TIMEOUT_MS = 50;
    const CONNECTION_DELAY_MS = 0;

    const scope = nock("http://www.mock.com")
      .post("/test-endpoint", {name:"John Smith"})
      .delayConnection(CONNECTION_DELAY_MS)
      .reply(201, {name:"Jane Doe"});

    let req = new Request(
      "http://www.mock.com/test-endpoint",
      {
        method: "POST",
        headers: {},
        body: JSON.stringify({name:"John Smith"})
      }
    );

    // unsafe cast to test private method
    let httpClient: any = new FetchHTTPClient(REQUEST_TIMEOUT_MS, 0, 0, false);
    let resp: Promise<Response> = httpClient.fetchWithDeadline(req);
    await resp
      .then(res => res.text())
      .then(body => expect(body).toBe("{\"name\":\"Jane Doe\"}"))
      .catch(msg => fail(msg));
  });

  test("fetchWithDeadline throws error when deadline not met", async () => {
    const REQUEST_TIMEOUT_MS = 50;
    const CONNECTION_DELAY_MS = 60;

    const scope = nock("http://www.mock.com")
      .post("/test-endpoint", {name:"John Smith"})
      .delayConnection(CONNECTION_DELAY_MS)
      .reply(201, {name:"Jane Doe"});

    let req = new Request(
      "http://www.mock.com/test-endpoint",
      {
        method: "POST",
        headers: {},
        body: JSON.stringify({name:"John Smith"})
      }
    );

    // unsafe cast to test private method
    let httpClient: any = new FetchHTTPClient(REQUEST_TIMEOUT_MS, 0, 0, false);
    let resp: Promise<Response> = httpClient.fetchWithDeadline(req);
    await resp
      .then(res => res.text())
      .then(text => fail(text))
      .catch(msg => expect(msg).toBe("HTTP request timed out after 50ms"));
  });

  test("dispatch with maxRetries = 0 throws on error", async () => {
    const scope = nock("http://www.mock.com")
      .get("/test-endpoint")
      .replyWithError("Boom!")
      .get("/test-endpoint")
      .reply(200, "We should never get here");

    let req = new Request(
      "http://www.mock.com/test-endpoint",
      {
        method: "GET",
        headers: {},
      }
    );

    // unsafe cast to test private method
    let httpClient: any = new FetchHTTPClient(1000, 0, 0, false);
    let resp: Promise<Response> = httpClient.dispatch(req);
    await resp
      .then(res => res.text())
      .then(body => fail(body))
      .catch(e => expect(e.message).toContain("Boom!"));
  });

  test("dispatch with maxRetries = 1 recovers from failure", async () => {
    const scope = nock("http://www.mock.com")
      .get("/test-endpoint")
      .replyWithError("Boom!")
      .get("/test-endpoint")
      .reply(200, "Success on retry!");

    let req = new Request(
      "http://www.mock.com/test-endpoint",
      {
        method: "GET",
        headers: {},
      }
    );

    // unsafe cast to test private method
    let httpClient: any = new FetchHTTPClient(1000, 1, 0, false);
    let resp: Promise<Response> = httpClient.dispatch(req);
    await resp
      .then(res => res.text())
      .then(body => expect(body).toBe("Success on retry!"))
      .catch(e => fail(e));
  });
});
