import express, {Request, Response} from "express";
import {FlatmatesClient} from "./flatmates/flatmates_client";
import {ListingsResponse} from "./flatmates/listings_response";
import {Coord, Geo} from "./geo";
import {RoomType} from "./flatmates/listings_request";

import {
  ClientResponse,
  createClient,
  DistanceMatrixRequest,
  DistanceMatrixResponse, GoogleMapsClient, LatLng,
  RequestHandle,
  ResponseCallback, TravelMode
} from "google__maps";
import {Try, TryCatch} from "common/fp/try";
import {sys} from "typescript";

/**
 * Atlas server instance running on Express middleware
 */
export class AtlasServer {
  constructor() {}
  private flatmatesClient!: FlatmatesClient;
  private googleMapsClient!: GoogleMapsClient;

  async start() {
    // Create API clients
    try {
      this.flatmatesClient = await FlatmatesClient.create();
      console.info("flatmates.com.au API client created successfully");
      this.googleMapsClient = this.createGoogleMapsClient(
        process.env.DISTANCE_MATRIX_API_KEY as string
      ).get();
      console.info("Google Maps API client created successfully");
    } catch (e) {
      console.error("Failed to initialize API clients: " + e);
      sys.exit(1);
    }

    // Create Express server
    const app = express();

    // Register Express routes
    // Register static assets relative to '/' route
    app.use('/', express.static(__dirname + '/static'));
    app.get('/', this.helloHandler);
    app.get('/indexx', this.index);

    app.listen(3000, () => console.log("Listening on port 3000"));

    let query = FlatmatesClient.buildAutocompleteRequest("redfer");
    let suggestions = await this.flatmatesClient!.autocomplete(query);
    console.dir(suggestions.query);
    console.dir(suggestions.results[0]);
  }

  helloHandler(req: Request, res: Response): void {
    res.send('Hello World')
  }

  index(req: Request, res: Response): void {
    console.log(__dirname + '/static/index.html');
    this.flatmatesClient.autocomplete(FlatmatesClient.buildAutocompleteRequest("hi"));
    FlatmatesClient.create().then( fmc => console.log(fmc));
    res.sendFile(__dirname + '/static/index.html');
  }

  async moveToUnitTest() {
    // TODO(wadejensen) move to unit tests
    let resp: ClientResponse<DistanceMatrixResponse> = await this.googleMapsClient
      .distanceMatrix({
        origins: [{lat: -33.929988, lng: 151.154641}],
        destinations: [{lat: -33.885358, lng: 151.211228}],
        mode: 'transit',
      })
      .asPromise();

    console.dir(resp.json.rows[0].elements[0]);
  }

  createGoogleMapsClient(apiKey: string): Try<GoogleMapsClient> {
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
}
