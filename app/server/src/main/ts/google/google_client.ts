import {
  DistanceMatrixRowElement,
  GoogleMapsClient,
  PlaceAutocompleteRequest,
  PlaceAutocompleteResult,
  PlaceDetailsRequest,
  PlaceDetailsResponse
} from "@google/maps";
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
      throw Error(`Invalid Google Maps API key: ${apiKey}`)
    }
  });
}

export async function placesAutocomplete(googleMapsClient: GoogleMapsClient, req: PlaceAutocompleteRequest): Promise<PlaceAutocompleteResult[]> {
  const resp = await googleMapsClient.placesAutoComplete(req).asPromise();
  if (resp.status != 200 && resp.json.status != "OK") {
    return Promise.reject();
  } else {
    return resp.json.predictions
  }
}

export async function placeDetails(googleMapsClient: GoogleMapsClient, req: PlaceDetailsRequest): Promise<PlaceDetailsResponse> {
  const resp = await googleMapsClient.place(req).asPromise();
  if (resp.status != 200 && resp.json.status != "OK") {
    return Promise.reject();
  } else {
    return resp.json
  }
}

export function getDurationValue(travelPlan: DistanceMatrixRowElement, travelMode: string): number {
  if (travelMode == "driving") {
    return travelPlan.duration_in_traffic.value
  } else {
    return travelPlan.duration.value
  }
}

export function getDurationDisplay(travelPlan: DistanceMatrixRowElement, travelMode: string): string {
  if (travelMode == "driving") {
    return travelPlan.duration_in_traffic.text
  } else {
    return travelPlan.duration.text
  }
}
