import express, {Express} from "express";
import path from "path";

// @ts-ignore
import { Person } from "common/person"
import { FlatmatesClient } from "./flatmates/flatmates_client";
import {Failure, Success, Try, TryCatch} from "common/fp/try";

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

  //const apiClients: Promise<[FlatmatesClient, string]> = Promise.all([
  //   FlatmatesClient.create(),
  //   Promise.resolve("Yay!")
  // ]);
  //
  // apiClients.then( clients => {
  //     const [flatmatesClient, googleMapsClient] = clients;
  //
  //     console.log(flatmatesClient);
  //     console.log(googleMapsClient);
  //
  //     app.set('flatmatesClient', flatmatesClient);
  //     app.set('googleMapsClient', googleMapsClient);
  //     registerRoutes(app);
  //     app.listen(3000, () => console.log("Listening on port 3000"));
  //   },
  //   reason => {
  //     console.log(`Could not initialize API clients for reason: ${reason}`);
  //     process.exit(1);
  //
  //   }
  // );
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
