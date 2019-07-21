import compression from "compression"
import express, {Request, Response} from "express";
import {FlatmatesClient} from "./flatmates/flatmates_client";

import {ClientResponse, DistanceMatrixResponse, GoogleMapsClient} from "google__maps";
import {Try, TryCatch} from "common/fp/try";
import {sys} from "typescript";
import * as path from "path";

import hbs from "hbs"

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

    app.listen(3000, () => console.log("Listening on port 3000"));

    let query = FlatmatesClient.buildAutocompleteRequest("redfer");
    let suggestions = await this.flatmatesClient!.autocomplete(query);
    console.dir(suggestions.query);
    console.dir(suggestions.results[0]);
  }

  helloHandler(req: Request, res: Response): void {
    res.send('Hello World')
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
