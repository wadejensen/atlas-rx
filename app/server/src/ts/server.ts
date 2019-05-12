import express from "express";
import path from "path";

// @ts-ignore
import { Person } from "common/person"
import { FlatmatesClient } from "./flatmates/flatmates_client";

let x = {
  "helloHello": 1,
  "goodbyeGoodbye": 2,
  "danceyDance": 3,
  "lamee_paradise": 4
};

FlatmatesClient.create();

console.log(x);

let p = new Person("Wade", 23, "Software Engineer", 100000.0);

console.log(p);

// Create Express server
const app = express();

function helloHandler(req: express.Request, res: express.Response): void {
    res.send('Hello World')
}

function index(req: express.Request, res: express.Response): void {
    console.log(__dirname + '/static/index.html');
    res.sendFile(__dirname + '/static/index.html');
}

app.use('/', express.static(__dirname + '/static'));

app.get('/', helloHandler);

app.get('/indexx', index);

app.listen(3000, () => console.log("Listening on port 3000"));

export default app;
