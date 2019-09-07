import {GoogleMapsClient} from "@google/maps";
import {Try, TryCatch} from "../../../../../common/src/main/ts/fp/try";

export function createGoogleMapsClient(apiKey: string): Try<GoogleMapsClient> {
  return TryCatch(() => {
    if (apiKey) {
      return require('@google/maps').createClient({
        key: apiKey,
        // Provide client with the right native Promise ctor to use
        Promise: Promise
      });
    } else {
      throw Error("Invalid Google Maps API key.")
    }
  });
}
