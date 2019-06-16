import {Preconditions} from "./preconditions";
import {Async} from "./async";
import {Headers, HTTPClient} from "./http_client";
import fetch, { Request, Response } from "node-fetch"

export class FetchHTTPClient implements HTTPClient {
  private readonly RETRY_LIMIT = 1000;

  constructor(
    readonly REQUEST_TIMEOUT_MS: number,
    readonly MAX_RETRIES: number,
    readonly BACKOFF_DELAY_MS: number,
    readonly EXPONENTIAL_BACKOFF: boolean
  ) {
    // Prevent callers triggering stack overflow
    Preconditions.checkArgument(
      MAX_RETRIES <= 1000,
      `Max retries must be less than or equal to ${this.RETRY_LIMIT}`
    );
  }

  get(url: string, headers?: Headers): Promise<Response> {
    return this.dispatch(new Request(url, {
      method: "GET",
      headers: headers,
    }));
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
    return Async.timeoutError(
      () => fetch(req),
      this.REQUEST_TIMEOUT_MS,
      `HTTP request timed out after ${this.REQUEST_TIMEOUT_MS}ms`
    );
  }
}
