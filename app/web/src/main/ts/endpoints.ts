import {PlacesAutocompleteResult} from "../../../../common/src/main/ts/google/places_autocomplete_result";
import {ListingsResponse} from "../../../../common/src/main/ts/flatmates/listings_response";
import {ListingsRequest} from "../../../../common/src/main/ts/flatmates/listings_request";
import {
  TravelTimeRequest,
  TravelTimeResponse
} from "../../../../common/src/main/ts/google/distance_matrix";

export async function googlePlacesAutocomplete(
  query: string
): Promise<PlacesAutocompleteResult> {
  return fetch(window.location + "google/places-autocomplete/" + query, {
    method: "GET",
    headers: {
      "Content-Type": "Accept: application/json",
    },
  }).then(resp => resp.json());
}

export async function googleDistanceMatrix(req: TravelTimeRequest): Promise<TravelTimeResponse> {
  console.warn("Distance matrix request");
  return fetch(`${window.location}google/distance-matrix`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  }).then(resp => resp.json());
}

export async function getFlatmatesListings(req: ListingsRequest): Promise<ListingsResponse> {
  return fetch(window.location + "flatmates/listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  }).then(resp => resp.json())
}

export async function hello(): Promise<string> {
  return fetch(window.location + "hello").then( resp => resp.text())
}
