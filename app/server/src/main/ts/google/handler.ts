import {Preconditions} from "../../../../../common/src/main/ts/preconditions";
import {isNonEmptyString} from "../util";
import {
  DistanceMatrixRowElement,
  GoogleMapsClient,
  PlaceAutocompleteResult,
  TransitMode,
  TravelMode
} from "@google/maps";
import {
  PlacesAutocompleteEntry,
  PlacesAutocompleteResult
} from "../../../../../common/src/main/ts/google/places_autocomplete_result";

import {Request, Response} from "express";
import {
  TravelTimeRequest,
  TravelInfo
} from "../../../../../common/src/main/ts/google/distance_matrix";
import {Failure, TryCatch} from "../../../../../common/src/main/ts/fp/try";
import {
  getDurationDisplay,
  getDurationValue,
  placeDetails,
  placesAutocomplete
} from "./google_client";

/**
 * Combines places autocomplete API and
 * @param googleMapsClient
 * @param req
 * @param res
 */
export async function googlePlacesAutoCompleteHandler (
  googleMapsClient: GoogleMapsClient,
  req: Request,
  res: Response
): Promise<void> {
  const MAX_SUGGESTIONS = 5;
  const SESSION_TOKEN = "googlePlacesAutoCompleteHandler";

  const validatedQuery = TryCatch(() => {
    const query = req.params.query;
    Preconditions.checkArgument(isNonEmptyString(query),
      `Query param in '${req.baseUrl}/:query' must be a string of non-zero length`);
    return query as string;
  }).recoverWith((err: Error) => {
    res.status(400);
    res.send(err);
    return new Failure<string>(err);
  });

  try {
    const autocompleteResults: PlaceAutocompleteResult[] = (await placesAutocomplete(googleMapsClient, {
      input: validatedQuery.get() as string,
      sessiontoken: SESSION_TOKEN,
      // approx centroid of Australia
      location: {
        lat: -23.867645,
        lng: 133.328079,
      },
      radius: 3000 * 1000,
      strictbounds: true,
    })).slice(0, MAX_SUGGESTIONS);

    const autocompleteEntries = autocompleteResults.map(async (p) => {
      const placeDetailsResp = await placeDetails(googleMapsClient, {
        placeid: p.place_id,
        sessiontoken: SESSION_TOKEN,
      });

      return new PlacesAutocompleteEntry(
        p.description,
        placeDetailsResp.result.geometry.location.lat,
        placeDetailsResp.result.geometry.location.lng,
      );
    });
    res.send(new PlacesAutocompleteResult(
      await Promise.all(autocompleteEntries))
    );
  } catch (err) {
    res.status(500);
    res.send(err);
    console.log(err);
  }
}

/**
 * Handler for DistanceMatrix requests with a single origin - destination pair
 */
export async function googleDistanceMatrixHandler (
  googleMapsClient: GoogleMapsClient,
  req: Request,
  res: Response
): Promise<void> {
  let travelTimeRequest: TravelTimeRequest = {} as any;
  try {
    travelTimeRequest = new TravelTimeRequest({ ...req.body});
  } catch (err) {
    console.error(err);
    res.status(400);
    res.send(err);
    return;
  }
  try {
    const resp = await googleMapsClient
      .distanceMatrix({
        origins: [{lat: travelTimeRequest.lat1, lng: travelTimeRequest.lng1}],
        destinations: [{lat: travelTimeRequest.lat2, lng: travelTimeRequest.lng2}],
        mode: travelTimeRequest.travelMode,
        transit_mode: travelTimeRequest.transitMode
          ? [travelTimeRequest.transitMode as TransitMode]
          : undefined,
      }).asPromise();
    if (resp.status == 200) {
      const result: DistanceMatrixRowElement = resp.json.rows[0].elements[0];
      res.send(
        new TravelInfo({
          duration: getDurationValue(result, req.params.travelMode),
          durationDisplay: getDurationDisplay(result, req.params.travelMode),
          travelMode: travelTimeRequest.travelMode,
          transitMode: travelTimeRequest.transitMode,
          distance: result.distance.text,
          originApproxAddress: resp.json.origin_addresses[0],
        })
      );
    } else {
      res.status(resp.status);
      res.send();
    }
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send(err);
  }
}

