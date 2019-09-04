import compression from "compression"
import express, {Request, Response} from "express";
import {FlatmatesClient} from "./flatmates/flatmates_client";

import {
  ClientResponse,
  DistanceMatrixRowElement,
  GoogleMapsClient,
  PlaceAutocompleteResponse,
  PlaceDetailsResponse,
  TransitMode,
  TravelMode
} from "google__maps";
import {Try, TryCatch} from "common/fp/try";
import {sys} from "typescript";
import * as path from "path";

import hbs from "hbs"
import {Preconditions} from "../../../../common/src/main/ts/preconditions";
import {ListingsRequest} from "common/flatmates/listings_request";
import {
  PlacesAutocompleteEntry,
  PlacesAutocompleteResult
} from "../../../../common/src/main/ts/google/places_autocomplete_result";
import {ListingsResponse} from "../../../../common/src/main/ts/flatmates/listings_response";
import {
  TravelTimeRequest,
  TravelTimeResponse
} from "../../../../common/src/main/ts/google/distance_matrix";
import bodyParser = require("body-parser");

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

    // Enable gzip compression of bundles
    app.use(compression());

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }));
    // parse application/json
    app.use(bodyParser.json());

    // Setup view engine for Google Maps API key templating into HTML
    app.set('view engine', 'html');
    app.engine('html', hbs.__express);

    // Register Express routes
    // Register static assets relative to '/' route
    app.use('/', express.static(path.join(__dirname + '/static')));
    app.set('views', path.join(__dirname + '/static/views'));

    app.get('/', function(req, res){
      // inject Google Maps Javascript API key into html
      res.render('index', {
        API_KEY: process.env.MAPS_JAVASCRIPT_API_KEY
      });
    });

    app.get('/hello', this.helloHandler);

    app.get('/flatmates/autocomplete/:query', this.flatmatesAutocompleteHandler);
    app.post('/flatmates/listings', this.flatmatesGetListingsHandler);
    app.get('/google/places-autocomplete/:query', this.googlePlacesAutoCompleteHandler);
    app.post('/google/distance-matrix', this.googleDistanceMatrixHandler);

    app.listen(3000, () => console.log("Listening on port 3000"));
  }

  helloHandler = (req: Request, res: Response) => {
    res.send('Hello World')
  };

  googlePlacesAutoCompleteHandler = async (req: Request, res: Response) => {
    const MAX_SUGGESTIONS = 5;
    const SESSION_TOKEN = "googlePlacesAutoCompleteHandler";

    const query = req.params.query;
    try {
      Preconditions.checkArgument(AtlasServer.isNonEmptyString(query),
        "Query param in 'google/places-autocomplete/:query' must be a string of non-zero length");
    } catch (err) {
      res.status(400);
      res.send(err);
      return;
    }

    try {
      const resp: ClientResponse<PlaceAutocompleteResponse> = await this.googleMapsClient
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
//
        // TODO(wadejensen) find an appropriate monad to model / collapse
        //  the nested failure case of the placeId lookup.
        const suggestions: PlacesAutocompleteResult = new PlacesAutocompleteResult(
          await Promise.all(rawPredictions.map(async (p) => {
            const rresp: ClientResponse<PlaceDetailsResponse> = await this.googleMapsClient.place({
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

  googleDistanceMatrixHandler = async (req: Request, res: Response) => {
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
      const resp = await this.googleMapsClient
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
            duration: this.getDuration(result, req.params.travelMode),
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

  getDuration(travelPlan: DistanceMatrixRowElement, travelMode: string): string {
    if (travelMode == "driving") {
      return travelPlan.duration_in_traffic.text
    } else {
      return travelPlan.duration.text
    }
  }

  flatmatesAutocompleteHandler = async (req: Request, res: Response) => {
    const query = req.params.query;
    try {
      Preconditions.checkArgument(AtlasServer.isNonEmptyString(query),
        "Query param in 'flatmates/autocomplete/:query' must be a string of non-zero length");
    } catch (err) {
      res.status(400);
      res.send(err);
    }
    try {
      const resp = await this.flatmatesClient.autocomplete(
        FlatmatesClient.buildAutocompleteRequest(query));
      res.send(resp);
    } catch (err) {
      res.status(500);
      res.send(err);
    }
  };

  flatmatesGetListingsHandler = async (req: Request, res: Response) => {
    const flatmatesListingsReq = new ListingsRequest({ ...req.body });
    const listings = await this.flatmatesClient.getFlatmatesListings(flatmatesListingsReq, 0);
    res.send(new ListingsResponse({ matches: Array.from(listings), non_matches: [] }));
  };

  static isNonEmptyString(val: any): boolean {
    return val !== undefined &&
      val !== null &&
      typeof(val) === "string" &&
      val.length > 0
  }

  static isLatOrLngCoord(val: any): boolean {
    return AtlasServer.isNumber(val) && val >= -180 && val <= 180;
  }

  static isNumber(val: any): boolean {
    return val !== undefined &&
      val !== null &&
      typeof(val) === "number"
  }

  static isTransitMode(val: any): boolean {
    return AtlasServer.isNonEmptyString(val) && (val === "bus" || val === "rail");
  }

  static isTravelMode(val: any): boolean {
    return AtlasServer.isNonEmptyString(val) &&
      new Set(['driving', 'walking', 'bicycling', 'transit']).has(val);
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
