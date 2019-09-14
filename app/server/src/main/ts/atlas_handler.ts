import {FlatmatesClient} from "./flatmates/flatmates_client";
import {Request, Response} from "express";
import {ListingsRequest} from "../../../../common/src/main/ts/listing";
import {TravelTime} from "../../../../common/src/main/ts/google/distance_matrix";
import {
  FlatmatesListing, Listing, ListingLocation,
  ListingsResponse
} from "../../../../common/src/main/ts/flatmates/listings_response";
import {
  DistanceMatrixRowElement,
  GoogleMapsClient,
  TransitMode,
  TravelMode
} from "@google/maps";
import LatLngLiteral = google.maps.LatLngLiteral;
import {getDurationDisplay, getDurationValue} from "./google/google_client";

const MAX_DISTANCE_MATRIX_API_ITEMS = 350;

export async function getListingsHandler(
  flatmatesClient: FlatmatesClient,
  googleMapsClient: GoogleMapsClient,
  req: Request,
  res: Response
): Promise<void> {
  try {
    // attempt to parse request body
    const listingsReq = new ListingsRequest({ ...req.body });
    const flatmatesListings = await flatmatesClient.getFlatmatesListings(listingsReq, 0);

    // has the user refined enough to use expensive search?
    if (useExpensiveSearch(listingsReq)) {
      // fail the request if user attempts to breach limits
      if (Array.from(flatmatesListings).length > MAX_DISTANCE_MATRIX_API_ITEMS) {
        res.status(400);
        const msg = `Too many listings returned for travel time filtering.
        Max Distance Matrix items per request: ${MAX_DISTANCE_MATRIX_API_ITEMS}.`
        res.send(msg);
        throw new Error(msg);
      }

      const compatibleListings = await filterListingsByTravelTime(
        googleMapsClient,
        Array.from(flatmatesListings),
        listingsReq.destination!,
        listingsReq.minTime!,
        listingsReq.maxTime!,
        listingsReq.travelMode!,
        listingsReq.transitMode,
      );
      res.send(new ListingsResponse(compatibleListings));
    } else {
      // no travel time criteria available for refinement
      const travelTime: TravelTime | undefined = undefined;
      const listings = Array.from(flatmatesListings).map(fml => toListing(fml, travelTime));
      res.send(new ListingsResponse(listings));
    }
  } catch (err) {
    res.status(500);
    res.send(err);
  }
}

function useExpensiveSearch(listingsRequest: ListingsRequest): boolean {
  return listingsRequest.destination !== undefined &&
    (listingsRequest.minTime !== undefined || listingsRequest.maxTime !== undefined)
}

async function filterListingsByTravelTime(
  googleMapsClient: GoogleMapsClient,
  flatmatesListings: Array<FlatmatesListing>,
  destination: LatLngLiteral,
  minTime: number,
  maxTime: number,
  travelMode: TravelMode,
  transitMode?: TransitMode
) {
    // enforce sensible limits for undefined min or max travel time
    const min = minTime || 0;
    const max = maxTime || 10000;

    const listings: Array<Listing> = await flatmatesListingsDistanceMatrix(
      googleMapsClient,
      Array.from(flatmatesListings),
      destination,
      travelMode,
      transitMode,
    );

    // filter out listings which are too close or too far away based on the
    // user's chosen method of transport
    return listings.filter(l => {
      const timeMins = l.traveTime!.duration / 60;
      return min <= timeMins && timeMins <= max
    });
  }

async function flatmatesListingsDistanceMatrix(
  googleMapsClient: GoogleMapsClient,
  listings: Array<FlatmatesListing>,
  destination: LatLngLiteral,
  travelMode: TravelMode,
  transitMode?: TransitMode
): Promise<Array<Listing>> {
  const origins: Array<LatLngLiteral> = listings.map(l => {
    return {
      lat: l.latitude,
      lng: l.longitude,
    }
  });

  const resp = await googleMapsClient.distanceMatrix({
    origins: origins,
    destinations: [destination],
    mode: travelMode,
    transit_mode: transitMode
      ? [transitMode as TransitMode]
      : undefined,
  }).asPromise();
  console.warn(resp);
  if (resp.status == 200) {
    const distanceRow: DistanceMatrixRowElement[] = resp.json.rows[0].elements;
    console.warn(distanceRow);
    const travelTimes = distanceRow.map(elem => new TravelTime({
      duration: getDurationValue(elem, travelMode),
      durationDisplay: getDurationDisplay(elem, travelMode),
      travelMode: travelMode,
      transitMode: transitMode,
    }));
    console.warn(travelTimes);
    return listings.map((fml: FlatmatesListing, i: number) =>
      toListing(fml, travelTimes[i]))
  } else {
    throw Error(`Distance matrix request failed with status code: ${resp.status}`)
  }
}

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

