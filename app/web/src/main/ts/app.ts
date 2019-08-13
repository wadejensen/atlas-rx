// @ts-ignore
import { Person } from "common/person"

import { populateMap } from "./maps"
import {ListingsRequest} from "common/flatmates/listings_request";
import {Coord, Geo} from "common/geo";
import {BoundingBox} from "../../../../common/src/main/ts/geo";
import {PropertyType, RoomType} from "../../../../common/src/main/ts/flatmates/listings_request";

let x = {
    "helloHello": 1,
    "goodbyeGoodbye": 2,
    "danceyDance": 3,
    "lamee_paradise": 4
};

let p = new Person("Wade", 26, "Software Engineer", 100000.0);

console.log(x);

console.log(p);

populateMap();

function expandSearchBox(): any {
    console.log("expand");
    let searchExpand = document.getElementById('search-expand')!;
    searchExpand.style.display="flex";
    searchExpand.style.zIndex="2";
}

function collapseSearchBox(): any {
    console.log("collapse");
    let searchExpand = document.getElementById('search-expand')!;
    searchExpand.style.display = "none";
    searchExpand.style.zIndex = "-1";
}

document.getElementById("search")!.onfocus = expandSearchBox;
// TODO add a close and search button listener
//document.getElementById("search")!.onblur = collapseSearchBox;

// test making a request back to the server
fetch(window.location + "hello")
  .then( resp => resp.text())
  .then( text => console.log(text));
fetch(window.location + "autocomplete/redfe")
  .then( resp => resp.json())
  .then( json => console.log(json));

const listingsRequest = new ListingsRequest({
    boundingBox: Geo.boundingBox(
      new Coord(-33.87755059238735,151.01137831057133),
      new Coord(-33.98294912171756,151.29255964602055),
    ),
    roomType: RoomType.PRIVATE_ROOM,
    minBudget: 300,
    maxBudget: 350,
});
fetch(window.location + "flatmates/listings", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(listingsRequest),
})
  .then(resp => resp.json())
  .then(json => console.log(json));
