import {Async} from "../../main/ts/async";

const nock = require("nock");
import fetch from "node-fetch"

describe("Async", () => {

  beforeEach(() => {
    nock.cleanAll();
  });

  test("delay", async () => {
    let start = Date.now();
    let result = await Async.delay(() => Promise.resolve("payload"), 50);
    let finish = Date.now();
    let duration = finish - start;
    // Some flake observed when expectation set to 50
    expect(duration).toBeGreaterThanOrEqual(49);
  });

  test("timeout (result)", async () => {
    let result = await Async.timeout(
      () => Promise.resolve("result"),
      () => "fallback",
      50
    );
    expect(result).toBe("result")
  });

  test("timeout (fallback)", async () => {
    let result = await Async.timeout(
      () => new Promise( (resolve, reject) => setTimeout(() => { resolve("result") }, 1000)),
      () => "fallback",
      50
    );
    expect(result).toBe("fallback")
  });

  test("timeoutError returns result if received before deadline", async () => {
    let result = Async.timeoutError(
      () => Promise.resolve("result"),
      50,
      "We should never see this"
    );

    await result
      .then(res => expect(res).toBe("result"))
      .catch(msg => fail(msg));
  });

  test("timeoutError rejects Promise if not result receeived before deadline", async () => {
    let result = Async.timeoutError(
      () => new Promise( (resolve, reject) => setTimeout(() => { resolve("result") }, 1000)),
      50,
      "Boom!"
    );

    await result
      .then(r => fail(r))
      .catch(msg => expect(msg).toBe("Boom!"));
  });

  test("backoff succeeds after retrying", async () => {
    const scope = nock("http://www.mock.com")
      .get("/unreliable-endpoint")
      .replyWithError("service unavailable")
      .get("/unreliable-endpoint")
      .replyWithError("service unavailable")
      .get("/unreliable-endpoint")
      .reply(200, "success after retry!");

    let result = Async.backoff(
      () => fetch("http://www.mock.com/unreliable-endpoint"),
      2,
      10
    );

    await result
      .then(r => r.text())
      .then(text => expect(text).toBe("success after retry!"))
      .catch(msg => fail(msg));
  });

  test("backoff fails when exceeds max retries)", async () => {
    const scope = nock("http://www.mock.com")
      .get("/unreliable-endpoint")
      .replyWithError("Service unavailable after zero retries.")
      .get("/unreliable-endpoint")
      .replyWithError("Service unavailable after one retry.")
      .get("/unreliable-endpoint", {allowUnmocked: true})
      .reply(200, "We should never see this.");

    let result = Async.backoff(
      () => fetch("http://www.mock.com/unreliable-endpoint"),
      1,
      10
    );

    await result
      .then(r => r.text())
      .then(text => fail(text))
      .catch(msg =>
        expect(msg).toBe(
"Retried request 1 times. Last error: \
FetchError: request to http://www.mock.com/unreliable-endpoint failed, \
reason: Service unavailable after one retry.")
      );
  });

  test("backoff waits between retries", async () => {
    const scope = nock("http://www.mock.com")
      .get("/unreliable-endpoint")
      .replyWithError("1st service unavailable")
      .get("/unreliable-endpoint")
      .replyWithError("2nd service unavailable")
      .get("/unreliable-endpoint")
      .replyWithError("3rd service unavailable");

    let start = Date.now();
    let result = Async.backoff(
      () => fetch("http://www.mock.com/unreliable-endpoint"),
      2,
      40
    );

    await result
      .then(r => r.text())
      .then(text => fail(text))
      .catch(msg => {
        let finish = Date.now();
        let duration = finish - start;

        expect(duration).toBeGreaterThanOrEqual(80);
        expect(msg).toBe(
"Retried request 2 times. Last error: \
FetchError: request to http://www.mock.com/unreliable-endpoint failed, \
reason: 3rd service unavailable");
      });
  });

  test("exponentialBackoff succeeds after retrying", async () => {
    const scope = nock("http://www.mock.com")
      .get("/unreliable-endpoint")
      .replyWithError("service unavailable")
      .get("/unreliable-endpoint")
      .replyWithError("service unavailable")
      .get("/unreliable-endpoint")
      .reply(200, "success after retry!");

    let result = Async.exponentialBackoff(
      () => fetch("http://www.mock.com/unreliable-endpoint"),
      2,
      10
    );

    await result
      .then(r => r.text())
      .then(text => expect(text).toBe("success after retry!"))
      .catch(msg => fail(msg));
  });

  test("exponentialBackoff fails when exceeds max retries)", async () => {
    const scope = nock("http://www.mock.com")
      .get("/unreliable-endpoint")
      .replyWithError("Service unavailable after zero retries.")
      .get("/unreliable-endpoint")
      .replyWithError("Service unavailable after one retry.")
      .get("/unreliable-endpoint", {allowUnmocked: true})
      .reply(200, "We should never see this.");

    let result = Async.exponentialBackoff(
      () => fetch("http://www.mock.com/unreliable-endpoint"),
      1,
      10
    );

    await result
      .then(r => r.text())
      .then(text => fail(text))
      .catch(msg =>
        expect(msg).toBe(
"Retried request 1 times. Last error: \
FetchError: request to http://www.mock.com/unreliable-endpoint failed, \
reason: Service unavailable after one retry.")
      );
  });

  test("exponentialBackoff waits between retries", async () => {
    const scope = nock("http://www.mock.com")
      .get("/unreliable-endpoint")
      .replyWithError("1st service unavailable")
      .get("/unreliable-endpoint")
      .replyWithError("2nd service unavailable")
      .get("/unreliable-endpoint")
      .replyWithError("3rd service unavailable");

    let start = Date.now();
    let result = Async.exponentialBackoff(
      () => fetch("http://www.mock.com/unreliable-endpoint"),
      2,
      40
    );

    await result
      .then(r => r.text())
      .then(text => fail(text))
      .catch(msg => {
        let finish = Date.now();
        let duration = finish - start;
        expect(duration).toBeGreaterThanOrEqual(120);
        expect(msg).toBe(
"Retried request 2 times. Last error: \
FetchError: request to http://www.mock.com/unreliable-endpoint failed, \
reason: 3rd service unavailable");
      });
  });
});
