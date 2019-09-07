import {Preconditions} from "../../../../../common/src/main/ts/preconditions";
import {isNonEmptyString} from "../util";
import {
  ClientResponse, DistanceMatrixRowElement,
  GoogleMapsClient,
  PlaceAutocompleteResponse,
  PlaceDetailsResponse, TransitMode, TravelMode
} from "@google/maps";
import {
  PlacesAutocompleteEntry,
  PlacesAutocompleteResult
} from "../../../../../common/src/main/ts/google/places_autocomplete_result";

import {Request, Response} from "express";
import {
  TravelTimeRequest,
  TravelTimeResponse
} from "../../../../../common/src/main/ts/google/distance_matrix";

export let googlePlacesAutoCompleteHandler = async (
  googleMapsClient: GoogleMapsClient,
  req: Request,
  res: Response
) => {
  const MAX_SUGGESTIONS = 5;
  const SESSION_TOKEN = "googlePlacesAutoCompleteHandler";

  const query = req.params.query;
  try {
    Preconditions.checkArgument(isNonEmptyString(query),
      "Query param in 'google/places-autocomplete/:query' must be a string of non-zero length");
  } catch (err) {
    res.status(400);
    res.send(err);
    return;
  }

  try {
    const resp: ClientResponse<PlaceAutocompleteResponse> = await googleMapsClient
      .placesAutoComplete({
        input: query as string,
        sessiontoken: SESSION_TOKEN,
        // approx centroid of Australia
        location: {
          lat: -23.867645,
          lng: 133.328079,
        },
        radius: 3000 * 1000,
        strictbounds: true
      }).asPromise();
    if (resp.status == 200) {
      const rawPredictions = resp
        .json
        .predictions
        .slice(0, MAX_SUGGESTIONS);

      // TODO(wadejensen) find an appropriate monad to model / collapse
      //  the nested failure case of the placeId lookup.
      const suggestions: PlacesAutocompleteResult = new PlacesAutocompleteResult(
        await Promise.all(rawPredictions.map(async (p) => {
          const rresp: ClientResponse<PlaceDetailsResponse> = await googleMapsClient.place({
            placeid: p.place_id,
            sessiontoken: SESSION_TOKEN
          }).asPromise();

          return new PlacesAutocompleteEntry(
            p.description,
            rresp.json.result.geometry.location.lat,
            rresp.json.result.geometry.location.lng
          );
        })),
      );
      res.send(suggestions);
    } else {
      res.status(resp.status);
      res.send();
    }
  } catch (e) {
    res.status(500);
    res.send(e);
    console.log(e);
  }
};


export let googleDistanceMatrixHandler = async (
  googleMapsClient: GoogleMapsClient,
  req: Request,
  res: Response
) => {
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
        mode: travelTimeRequest.travelMode as TravelMode,
        transit_mode: [travelTimeRequest.transitMode as TransitMode],
      }).asPromise();
    const result: DistanceMatrixRowElement = resp.json.rows[0].elements[0];
    if (resp.status == 200) {
      res.send(
        new TravelTimeResponse({
          duration: getDuration(result, req.params.travelMode),
          travelMode: travelTimeRequest.transitMode || travelTimeRequest.travelMode,
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
};

function getDuration(travelPlan: DistanceMatrixRowElement, travelMode: string): string {
  if (travelMode == "driving") {
    return travelPlan.duration_in_traffic.text
  } else {
    return travelPlan.duration.text
  }
}
