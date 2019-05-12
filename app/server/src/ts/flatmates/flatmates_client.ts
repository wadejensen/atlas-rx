import fetch, { Request, Response } from "node-fetch"

export class FlatmatesClient {
    private static readonly baseUrl: string = "https://flatmates.com.au";

    static async create() {
        const resp: Response = await fetch(FlatmatesClient.baseUrl);
        const html: string = await resp.text();

        const maybeMatches = html.match(".*csrf-token.*");

        if (maybeMatches != null) {
            console.dir(maybeMatches[0]);
        }
    }

}
