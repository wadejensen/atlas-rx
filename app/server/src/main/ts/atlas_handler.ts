import {FlatmatesClient} from "./flatmates/flatmates_client";
import {Request, Response} from "express";
import {ListingsRequest} from "../../../../common/src/main/ts/listing";
import {TravelTime} from "../../../../common/src/main/ts/google/distance_matrix";
import {
  FlatmatesListing, Listing, ListingLocation,
  ListingsResponse
} from "../../../../common/src/main/ts/flatmates/listings_response";

const MAX_DISTANCE_MATRIX_API_ITEMS = 350;

export async function getListingsHandler(
  flatmatesClient: FlatmatesClient,
  req: Request,
  res: Response
): Promise<void> {
  try {
    // attempt to parse request body
    const listingsReq = new ListingsRequest({ ...req.body });
    const flatmatesListings = await flatmatesClient.getFlatmatesListings(listingsReq, 0);

    if (listingsReq.minTime !== undefined || listingsReq.maxTime !== undefined) {
      // fail the request if user attempts to breach limits
      if (Array.from(flatmatesListings).length > MAX_DISTANCE_MATRIX_API_ITEMS) {
        res.status(400);
        res.send(`
Too many listings returned for travel time filtering.
Max Distance Matrix items per request: ${MAX_DISTANCE_MATRIX_API_ITEMS}.
`)
      }
      else {
        // enforce sensible limits for undefined min or max travel time
        const min = listingsReq.minTime || 0;
        const max = listingsReq.maxTime || 10000;
      }
    }

    const travelTime: TravelTime | undefined = undefined;
    const listings = Array.from(flatmatesListings).map(fml => toListing(fml, travelTime));
    res.send(new ListingsResponse(listings));
  } catch (err) {
    res.status(500);
    res.send(err);
  }
}

// async function distanceMatrix(minTime: number, maxTime: number) {
//   let travelTimeRequest: TravelTimeRequest = {} as any;
//   try {
//     travelTimeRequest = new TravelTimeRequest({ ...req.body});
//   } catch (err) {
//     console.error(err);
//     res.status(400);
//     res.send(err);
//     return;
//   }
//   try {
//     const resp = await googleMapsClient
//       .distanceMatrix({
//         origins: [{lat: travelTimeRequest.lat1, lng: travelTimeRequest.lng1}],
//         destinations: [{lat: travelTimeRequest.lat2, lng: travelTimeRequest.lng2}],
//         mode: travelTimeRequest.travelMode as TravelMode,
//         transit_mode: [travelTimeRequest.transitMode as TransitMode],
//       }).asPromise();
//     const result: DistanceMatrixRowElement = resp.json.rows[0].elements[0];
//     if (resp.status == 200) {
//       res.send(
//         new TravelTime({
//           duration: getDurationValue(result, req.params.travelMode),
//           durationDisplay: getDurationDisplay(result, req.params.travelMode),
//           travelMode: travelTimeRequest.travelMode,
//           transitMode: travelTimeRequest.transitMode,
//         })
//       );
//     } else {
//       res.status(resp.status);
//       res.send();
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500);
//     res.send(err);
//   }
// }
// }

function toListing(
  fml: FlatmatesListing,
  travelTime?: TravelTime
): Listing {
  return new Listing({
    listingLocation: new ListingLocation({
      latitude: fml.latitude,
      longitude: fml.longitude,
      rent: fml.rent[0],
      subheading: fml.subheading,
      listingLink: fml.listing_link,
      photo: fml.photo,
    }),
    travelTime,
  });
}

