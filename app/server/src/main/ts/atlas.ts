import compression from "compression"
import express, {Request, Response} from "express";
import {FlatmatesClient} from "./flatmates/flatmates_client";

import {
  ClientResponse,
  DistanceMatrixResponse,
  GoogleMapsClient,
  PlaceAutocompleteResponse, PlaceDetailsResponse
} from "google__maps";
import {Try, TryCatch} from "common/fp/try";
import {sys} from "typescript";
import * as path from "path";

import hbs from "hbs"
import {Preconditions} from "../../../../common/src/main/ts/preconditions";
import {ListingsRequest} from "common/flatmates/listings_request";
import bodyParser = require("body-parser");
import {
  PlacesAutocompleteEntry,
  PlacesAutocompleteResult
} from "../../../../common/src/main/ts/google/places_autocomplete_result";
import {
  FlatmatesListing,
  ListingsResponse
} from "../../../../common/src/main/ts/flatmates/listings_response";

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

    // Setup view engine for API key templating
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

    app.get('/gmap', function(req, res){
      // inject Google Maps Javascript API key into html
      res.render('gmap', {
        API_KEY: process.env.MAPS_JAVASCRIPT_API_KEY
      });
    });

    app.get('/hello', this.helloHandler);

    app.get('/flatmates/autocomplete/:query', this.flatmatesAutocompleteHandler);
    app.post('/flatmates/listings', this.flatmatesGetListingsHandler);

    app.get('/google/places-autocomplete/:query', this.googlePlacesAutoCompleteHandler);

    app.listen(3000, () => console.log("Listening on port 3000"));

    let query = FlatmatesClient.buildAutocompleteRequest("redfer");
    let suggestions = await this.flatmatesClient!.autocomplete(query);
    console.dir(suggestions.query);
    console.dir(suggestions.results[0]);
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
    }

    try {
      const resp: ClientResponse<PlaceAutocompleteResponse> = await this.googleMapsClient
        .placesAutoComplete({
          input: query as string,
          sessiontoken: SESSION_TOKEN
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
      typeof(val) == "string" &&
      val.length > 0
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
