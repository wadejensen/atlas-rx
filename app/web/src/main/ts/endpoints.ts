import {PlacesAutocompleteResult} from "../../../../common/src/main/ts/google/places_autocomplete_result";
import {ListingsResponse} from "../../../../common/src/main/ts/flatmates/listings_response";
import {TravelTime, TravelTimeRequest} from "../../../../common/src/main/ts/google/distance_matrix";
import {ListingsRequest} from "../../../../common/src/main/ts/listing";

export async function googlePlacesAutocomplete(
  query: string
): Promise<PlacesAutocompleteResult> {
  return fetch(window.location + "google/places-autocomplete/" + query, {
    method: "GET",
    headers: {
      "Content-Type": "Accept: application/json",
    },
  }).then(handleFailure)
    .then(resp => resp.json())
    .catch(err => console.error(err));
}

export async function googleDistanceMatrix(req: TravelTimeRequest): Promise<TravelTime> {
  console.warn("Distance matrix request");
  return fetch(`${window.location}google/distance-matrix`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  }).then(handleFailure)
    .then(resp => resp.json())
    .catch(err => console.error(err));
}

export async function getListings(req: ListingsRequest): Promise<ListingsResponse> {
  return fetch(window.location + "listings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  }).then(handleFailure)
    .then(resp => resp.json())
    .catch(err => console.error(err));
}

export async function health(): Promise<string> {
  return fetch(window.location + "healthz").then( resp => resp.text());
}

async function handleFailure(resp: Response): Promise<Response> {
  if (resp.status !== 200) {
    throw new Error(await resp.text());
  } else {
    return resp;
  }
}
