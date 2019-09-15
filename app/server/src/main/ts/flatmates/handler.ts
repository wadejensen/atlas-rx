import {Request, Response} from "express";
import {Preconditions} from "../../../../../common/src/main/ts/preconditions";
import {FlatmatesClient} from "./flatmates_client";
import {isNonEmptyString} from "../util";
import {
  FlatmatesListing,
  Listing, ListingLocation,
  ListingsResponse
} from "../../../../../common/src/main/ts/flatmates/listings_response";
import {TravelInfo} from "../../../../../common/src/main/ts/google/distance_matrix";
import {ListingsRequest} from "../../../../../common/src/main/ts/listing";

/**
 * Proxy autocomplete request to flatmates.com.au autocomplete API
 */
export async function flatmatesAutocompleteHandler(
  flatmatesClient: FlatmatesClient,
  req: Request, res: Response
): Promise<void> {
  const query = req.params.query;
  try {
    Preconditions.checkArgument(isNonEmptyString(query),
      `Query param in '${req.baseUrl}/:query' must be a string of non-zero length`);
  } catch (err) {
    res.status(400);
    res.send(err);
  }
  try {
    const resp = await flatmatesClient.autocomplete(
      FlatmatesClient.buildAutocompleteRequest(query)
    );
    res.send(resp);
  } catch (err) {
    res.status(500);
    res.send(err);
  }
}
