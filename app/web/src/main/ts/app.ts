// @ts-ignore
import {Person} from "common/person"
import {centreMap, getBounds} from "./maps"
import {Coord} from "common/geo";
import {FreeBrowse} from "./page_state";
import {googlePlacesAutocomplete, hello} from "./endpoints";
import {setupContentUpdateListeners, setupStateChangeListeners} from "./listeners";
import {
    BathroomType,
    FurnishingType,
    ListingsRequest, ParkingType,
    RoomType
} from "../../../../common/src/main/ts/flatmates/listings_request";

let x = {
    "helloHello": 1,
    "goodbyeGoodbye": 2,
    "danceyDance": 3,
    "lamee_paradise": 4
};

let p = new Person("Wade", 26, "Software Engineer", 100000.0);

console.log(x);

console.log(p);

// test making a request back to the server
fetch(window.location + "hello")
  .then( resp => resp.text())
  .then( text => console.log(text));
fetch(window.location + "flatmates/autocomplete/redfe")
  .then( resp => resp.json())
  .then( json => console.log(json));


// testing on application start to keep an eye out for regressions
hello();
googlePlacesAutocomplete("redfe").then( json => console.log(json));

// setup web app dynamic content
setupStateChangeListeners();
setupContentUpdateListeners();

// const listingsRequest = new ListingsRequest({
//     boundingBox: Geo.boundingBox(
//       new Coord(-33.87755059238735,151.01137831057133),
//       new Coord(-33.98294912171756,151.29255964602055),
//     ),
//     roomType: RoomType.PRIVATE_ROOM,
//     minBudget: 300,
//     maxBudget: 350,
// });

// fetch(window.location + "flatmates/listings", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json",
//     },
//     body: JSON.stringify(listingsRequest),
// })
//   .then(resp => resp.json())
//   .then(json => console.log(json));

fetch(window.location + "google/places-autocomplete/2 George St", {
    method: "GET",
    headers: {
        "Content-Type": "Accept: application/json",
    },
})
  .then(resp => resp.json())
  .then(json => console.log(json));


let pageState = new FreeBrowse();

// user navigates to atlas -> tick
// google map with a default of sydney -> tick
// populate with map markers from flatmates.com.au results based on map geo bounds -> tick
// users can click flatmates price markers to see a flyout card and link -> TODO

// changes to zoom level issue a request to plot more markers flatmates map markers -> tick

// user starts typing a destination -> tick
// autocomplete provides a list of options -> tick
// user selects one of the options -> tick
// search bar collapses and turns into a "filters" menu -> tick
// centre google map on lat lng of suggestion. zoom level = 15 -> tick
// user can now click on results to see travel time -> TODO

// user clicks filters menu -> TODO
// user enters search criteria -> TODO
// user hits search now button -> TODO
// we update the standing filters state of the users flatmates requests -> TODO
// user clicks on result -> TODO
// user gets a flyout of the result with details, including travel time -> TODO

// user can adjust travel settings -> TODO
// mode of transport -> TODO


// a better, safer throttle -> tick

// need to remove duplicate map markers before plotting more
