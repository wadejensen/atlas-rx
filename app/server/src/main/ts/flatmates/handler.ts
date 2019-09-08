import {Request, Response} from "express";
import {Preconditions} from "../../../../../common/src/main/ts/preconditions";
import {FlatmatesClient} from "./flatmates_client";
import {isNonEmptyString} from "../util";
import {ListingsResponse} from "../../../../../common/src/main/ts/flatmates/listings_response";
import {ListingsRequest} from "../../../../../common/src/main/ts/flatmates/listings_request";

/**
 * Proxy autocomplete request to flatmates.com.au autocomplete API
 */
export async function flatmatesAutocompleteHandler (
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
};

/**
 * Proxy listings request to flatmates.com.au
 * Chunks up the proxied flatmates request into many smaller requests,
 * with very conservative rate-limiting, and normalise the results.
 */
export async function flatmatesGetListingsHandler(
  flatmatesClient: FlatmatesClient,
  req: Request,
  res: Response
): Promise<void> {
  try {
    // attempt to parse request body
    const flatmatesListingsReq = new ListingsRequest({ ...req.body });
    const listings = await flatmatesClient.getFlatmatesListings(flatmatesListingsReq, 0);
    res.send(new ListingsResponse({ matches: Array.from(listings), non_matches: [] }));
  } catch (err) {
    res.status(500);
    res.send(err);
  }
}
