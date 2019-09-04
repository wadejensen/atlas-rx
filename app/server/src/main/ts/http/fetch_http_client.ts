import { Headers, HTTPClient} from "./http_client";
import fetch, { Request, Response } from "node-fetch"
import {Preconditions} from "../../../../../common/src/main/ts/preconditions";
import {Async} from "../async";

export class FetchHTTPClient implements HTTPClient {
  private readonly RETRY_LIMIT = 1000;

  constructor(
    readonly requestTimeoutMs: number,
    readonly maxRetries: number,
    readonly backoffDelayMs: number,
    readonly exponentialBackoff: boolean
  ) {
    // Prevent callers triggering stack overflow
    Preconditions.checkArgument(
      maxRetries <= 1000,
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
    // perform fetch with a timeout deadline for each HTTP request and the
    // selected retry backoff policy
    if (this.maxRetries <= 0) {
      return this.fetchWithDeadline(req);
    }
    else if (!this.exponentialBackoff) {
      return Async.backoff(
        () => this.fetchWithDeadline(req),
        this.maxRetries,
        this.backoffDelayMs
      )
    } else {
      return Async.exponentialBackoff(
        () => this.fetchWithDeadline(req),
        this.maxRetries,
        this.backoffDelayMs
      )
    }
  }

  private fetchWithDeadline(req: Request): Promise<Response> {
    // Wrap the fetch API with a timeout
    return Async.timeoutError(
      () => fetch(req),
      this.requestTimeoutMs,
      `HTTP request timed out after ${this.requestTimeoutMs}ms`
    );
  }
}
