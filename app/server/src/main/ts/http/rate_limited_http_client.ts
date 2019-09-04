import {Headers, HTTPClient} from "./http_client";
import {Request, Response} from "node-fetch";
import {FetchHTTPClient} from "./fetch_http_client";
import {LosslessThrottle} from "../lossless_throttle";

export class RateLimitedHTTPClient implements HTTPClient{
  static create({
      requestTimeoutMs,
      maxRetries,
      backoffDelay,
      exponentialBackoff,
      maxReqPerSec,
  }: {
      requestTimeoutMs: number,
      maxRetries: number,
      backoffDelay: number,
      exponentialBackoff: boolean,
      maxReqPerSec: number,
  }): RateLimitedHTTPClient {
    return new RateLimitedHTTPClient(
      new FetchHTTPClient(requestTimeoutMs, maxRetries, backoffDelay, exponentialBackoff),
      new LosslessThrottle(maxReqPerSec),
    );
  }

  constructor(readonly client: HTTPClient, readonly throttle: LosslessThrottle) {}

  get(url: string, headers?: Headers): Promise<Response> {
    return this.throttle.apply(() => this.client.get(url, headers));
  }

  post(url: string, headers?: Headers, body?: string): Promise<Response> {
    return this.throttle.apply(() => this.client.post(url, headers, body));
  }

  put(url: string, headers?: Headers, body?: string): Promise<Response> {
    return this.throttle.apply(() => this.client.put(url, headers, body));
  }

  delete(url: string, headers?: Headers, body?: string): Promise<Response> {
    return this.throttle.apply(() => this.client.delete(url, headers, body));
  }

  dispatch(req: Request): Promise<Response> {
    return this.throttle.apply(() => this.client.dispatch(req));
  }
}
