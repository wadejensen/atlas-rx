// @ts-ignore
import {Person} from "common/person"
import {googlePlacesAutocomplete, hello} from "./endpoints";
import {setupContentUpdateListeners, setupStateChangeListeners} from "./listeners";

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


fetch(window.location + "google/places-autocomplete/2 George St", {
    method: "GET",
    headers: {
        "Content-Type": "Accept: application/json",
    },
})
  .then(resp => resp.json())
  .then(json => console.log(json));


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

// user clicks filters menu -> tick
// user enters search criteria -> tick
// user hits search now button -> tick
// we update the standing filters state of the users flatmates requests -> tick
// user clicks on result -> TODO
// user gets a flyout of the result with details, including travel time -> TODO

// user can adjust travel settings -> TODO
// mode of transport -> TODO


// a better, safer throttle -> tick

// need to remove duplicate map markers before plotting more -> tick
