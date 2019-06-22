import express, {Request, Response} from "express";
import {FlatmatesClient} from "./flatmates/flatmates_client";
import {MapMarkersResponse} from "./flatmates/map_markers_response";
import {Coord, Geo} from "./geo";
import {RoomType} from "./flatmates/flatmates_listings_request";

/**
 * Atlas server instance running on Express middleware
 */
export class AtlasServer {
  constructor() {}
  private flatmatesClient?: FlatmatesClient;

  async start() {
    // Create Express server
    const app = express();

    // Create API clients
    this.flatmatesClient = await FlatmatesClient.create();

    // Register Express routes
    // Register static assets relative to '/' route
    app.use('/', express.static(__dirname + '/static'));
    app.get('/', AtlasServer.helloHandler);
    app.get('/indexx', AtlasServer.index);

    app.listen(3000, () => console.log("Listening on port 3000"));
  }

  static helloHandler(req: Request, res: Response): void {
    res.send('Hello World')
  }

  static index(req: Request, res: Response): void {
    console.log(__dirname + '/static/index.html');
    FlatmatesClient.create().then( fmc => console.log(fmc));
    res.sendFile(__dirname + '/static/index.html');
  }

  moveToUnitTest() {
    // TODO(wadejensen) move to unit tests
    let req = FlatmatesClient.buildListingsRequest({
      boundingBox: Geo.boundingBox(
        new Coord(-33.874322, 151.194749),
        new Coord(-33.883343, 151.209044)
      ),
      roomType: RoomType.PRIVATE_ROOM,
    });

    let resp: Promise<MapMarkersResponse> = this.flatmatesClient!
      .flatmatesListings(req);

    resp
      .then(r => console.log(r.matches[0]))
      .catch( reason => console.log(reason));
  }
}
