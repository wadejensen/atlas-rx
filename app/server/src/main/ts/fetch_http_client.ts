import {Preconditions} from "./preconditions";
import {Async} from "./async";

import fetch, { Request, Response } from "node-fetch"

export type Headers = { [key: string]: string }

export class FetchHTTPClient {
  private readonly RETRY_LIMIT = 1000;

  constructor(
    readonly REQUEST_TIMEOUT_MS: number,
    readonly MAX_RETRIES: number,
    readonly BACKOFF_DELAY_MS: number,
    readonly EXPONENTIAL_BACKOFF: boolean
  ) {
    Preconditions.checkArgument(
      MAX_RETRIES <= 1000,
      `Max retries must be below ${this.RETRY_LIMIT}`
    );
  }

  get(url: string, headers?: Headers, body?: string): Promise<Response> {
    try {
      console.log("GET");
      let x = this.dispatch(new Request(url, {
        method: "GET",
        headers: headers,
        body: body
      }));
      console.log("WTF");
      return x;
    }
    catch (e) {
      console.log("Boom");
      console.error(e);
      throw e;
    }
  }

  post(url: string, headers?: Headers, body?: string): Promise<Response> {
    return this.dispatch(new Request(url, {
      method: "POST",
      headers: headers,
      body: body
    }));
  }

  put(url: string, headers?: Headers, body?: string): Promise<Response> {
    return this.dispatch(new Request(url, {
      method: "PUT",
      headers: headers,
      body: body
    }));
  }

  delete(url: string, headers?: Headers, body?: string): Promise<Response> {
    return this.dispatch(new Request(url, {
      method: "DELETE",
      headers: headers,
      body: body
    }));
  }

  /**
   * Performs a WHATWG fetch with a timeout deadline for each HTTP request and the
   * selected retry backoff policy
   */
  dispatch(req: Request): Promise<Response> {
    console.log("Dispatch");
    // perform fetch with a timeout deadline for each HTTP request and the
    // selected retry backoff policy
    if (this.MAX_RETRIES <= 0) {
      console.log("MAX_RETRIES <= 0");

      let res = this.fetchWithDeadline(req)
      console.log(res);
      return res;
    }
    else if (!this.EXPONENTIAL_BACKOFF) {
      return Async.backoff(
        () => this.fetchWithDeadline(req),
        this.MAX_RETRIES,
        this.BACKOFF_DELAY_MS
      )
    } else {
      console.log("Exp branch");
      return Async.exponentialBackoff(
        () => this.fetchWithDeadline(req),
        this.MAX_RETRIES,
        this.BACKOFF_DELAY_MS
      )
    }
  }

  private fetchWithDeadline(req: Request): Promise<Response> {
    // Wrap the fetch API with a timeout
    console.log("Fetch with deadline");
    console.log(`Timeout = ${this.REQUEST_TIMEOUT_MS}`)

    return fetch(req);
    // return Async.timeoutError(
    //   () => fetch(req),
    //   this.REQUEST_TIMEOUT_MS,
    //   `HTTP request timed out after ${this.REQUEST_TIMEOUT_MS}ms`
    // );
  }
}
