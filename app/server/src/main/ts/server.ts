import express, {Express} from "express";
// @ts-ignore
import {Person} from "common/person"
import {FlatmatesClient} from "./flatmates/flatmates_client";
import {RoomType} from "./flatmates/map_markers_request";
import {Coord, Geo} from "./geo";
import {MapMarkersResponse} from "./flatmates/map_markers_response";

// import fetch, { Request, Response } from "node-fetch"

let x = {
  "helloHello": 1,
  "goodbyeGoodbye": 2,
  "danceyDance": 3,
  "lamee_paradise": 4
};

console.log(x);

startServer();

let p = new Person("Wade", 23, "Software Engineer", 100000.0);
console.log(p);

/**
 * Launch Express webserver and initialize global API clients
 */
function startServer() {
  // Create Express server
  const app = express();
  registerRoutes(app);
  app.listen(3000, () => console.log("Listening on port 3000"));

  let resp: Promise<MapMarkersResponse> = FlatmatesClient.flatmatesListings(
    {
      boundingBox: Geo.boundingBox(
        new Coord(-33.874322, 151.194749),
        new Coord(-33.883343, 151.209044)
      ),
      room: RoomType.PRIVATE_ROOM,
    });

  resp
    .then(r => console.log(r.matches[0]))
    .catch( reason => console.log(reason));
}

function registerRoutes(app: Express) {
  app.use('/', express.static(__dirname + '/static'));
  app.get('/', helloHandler);
  app.get('/indexx', index);
}

function helloHandler(req: express.Request, res: express.Response): void {
  res.send('Hello World')
}

function index(req: express.Request, res: express.Response): void {
  console.log(__dirname + '/static/index.html');
  FlatmatesClient.create().then( fmc => console.log(fmc));
  res.sendFile(__dirname + '/static/index.html');
}
