import fetch, { Request, Response } from "node-fetch"
export type Headers = { [key: string]: string }

export interface HTTPClient {
  get(url: string, headers?: Headers): Promise<Response>
  post(url: string, headers?: Headers, body?: string): Promise<Response>
  put(url: string, headers?: Headers, body?: string): Promise<Response>
  delete(url: string, headers?: Headers, body?: string): Promise<Response>
  dispatch(req: Request): Promise<Response>
}
