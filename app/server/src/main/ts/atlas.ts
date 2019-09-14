import compression from "compression"
import express, {Request, Response} from "express";
import {FlatmatesClient} from "./flatmates/flatmates_client";

import {GoogleMapsClient} from "google__maps";
import {sys} from "typescript";
import * as path from "path";

import hbs from "hbs"
import {flatmatesAutocompleteHandler} from "./flatmates/handler";
import {googleDistanceMatrixHandler, googlePlacesAutoCompleteHandler} from "./google/handler";
import bodyParser = require("body-parser");
import {createGoogleMapsClient} from "./google/google_client";
import {getListingsHandler} from "./atlas_handler";

/**
 * Atlas server instance running on Express middleware
 */
export class AtlasServer {
  constructor() {}
  private flatmatesClient!: FlatmatesClient;
  private googleMapsClient!: GoogleMapsClient;
  private mapsJavascriptAPIKey!: string;

  async start() {
    // Create API clients
    try {
      this.flatmatesClient = await FlatmatesClient.create();
      console.info("flatmates.com.au API client created successfully");
      this.googleMapsClient = createGoogleMapsClient(
        process.env.MAPS_SERVER_API_KEY as string
      ).get();
      console.info("Google Maps API client created successfully");
      if (process.env.MAPS_JAVASCRIPT_API_KEY) {
        this.mapsJavascriptAPIKey = process.env.MAPS_JAVASCRIPT_API_KEY;
      } else {
        throw new Error("MAPS_JAVASCRIPT_API_KEY environment variable not defined")
      }
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

    app.get('/', (req: Request, res: Response) => {
      // inject Google Maps Javascript API key into html
      res.render('index', {
        API_KEY: this.mapsJavascriptAPIKey,
      });
    });

    // debugging endpoint
    app.get('/healthz', (req: Request, res: Response) => {
      res.status(200);
      res.send(new Date().getTime());
    });

    app.get('/flatmates/autocomplete/:query', (req: Request, res: Response) => {
      return flatmatesAutocompleteHandler(this.flatmatesClient, req, res);
    });

    app.get('/google/places-autocomplete/:query', (req: Request, res: Response) => {
      return googlePlacesAutoCompleteHandler(this.googleMapsClient, req, res);
    });
    app.post('/google/distance-matrix',  (req: Request, res: Response) => {
      return googleDistanceMatrixHandler(this.googleMapsClient, req, res);
    });

    app.post('/listings', (req: Request, res: Response) => {
      return getListingsHandler(this.flatmatesClient, this.googleMapsClient, req, res);
    });

    app.listen(3000, () => console.log("Listening on port 3000"));
  }
}
