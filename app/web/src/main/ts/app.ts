// @ts-ignore
import { Person } from "common/person"
import {
    addMapMarker,
    centreMap,
    getBounds, keepMapUpdated,
    orangeMarkerIcon,
    RGB
} from "./maps"
import {ListingsRequest} from "common/flatmates/listings_request";
import {Coord, Geo} from "common/geo";
import {BoundingBox} from "../../../../common/src/main/ts/geo";
import {PropertyType, RoomType} from "../../../../common/src/main/ts/flatmates/listings_request";
import {PlacesAutocompleteResult} from "../../../../common/src/main/ts/google/places_autocomplete_result";
import {TryCatch} from "../../../../common/src/main/ts/fp/try";
import {
    FlatmatesListing,
    ListingsResponse
} from "../../../../common/src/main/ts/flatmates/listings_response";
import {FreeBrowse} from "./page_state";

let x = {
    "helloHello": 1,
    "goodbyeGoodbye": 2,
    "danceyDance": 3,
    "lamee_paradise": 4
};

let p = new Person("Wade", 26, "Software Engineer", 100000.0);

console.log(x);

console.log(p);

function expandSearchBox(): any {
    console.log("expand");
    let searchExpand = document.getElementById('search-expand')!;
    let search = document.getElementById('search1')!;
    let searchSuggestions = document.getElementById('search-suggestions')!;

    showElement(searchExpand);
    showElement(search);
    showElement(searchSuggestions);
}

function collapseSearchBox(): any {
    console.log("collapse");

    let searchExpand = document.getElementById('search-expand')!;
    let search = document.getElementById('search1')!;
    let searchSuggestions = document.getElementById('search-suggestions')!;

    hideElement(searchExpand);
    hideElement(search);
    hideElement(searchSuggestions);
}

function showElement(element: HTMLElement): void {
    element.style.display="flex";
    element.style.zIndex="2";
}

function hideElement(element: HTMLElement): void {
    element.style.display = "none";
    element.style.zIndex = "-1";
}

document.getElementById("search1")!.addEventListener("focusin", expandSearchBox);
document.getElementById("search2")!.addEventListener("focusin", expandSearchBox);
// TODO add a close and search button listener
//document.getElementById("search")!.onblur = collapseSearchBox;

document.getElementById("search-button")!.addEventListener("click", collapseSearchBox);

document.getElementById("search1")!.addEventListener("keyup", () => {
    console.log("keyup event");
    populateSearchSuggestions();
});

async function populateSearchSuggestions(): Promise<void> {
    TryCatch( async () => {
        const query = (document.getElementById("search1") as HTMLInputElement)!.value;
        if (query != "") {
            const suggestions = await googlePlacesAutocomplete(query)
            console.log(suggestions);
            updateSearchSuggestions(suggestions)
        }
    })
}

async function googlePlacesAutocomplete(
  query: string
): Promise<PlacesAutocompleteResult> {
    return fetch(window.location + "google/places-autocomplete/" + query, {
        method: "GET",
        headers: {
            "Content-Type": "Accept: application/json",
        },
    }).then(resp => resp.json());
}

// test making a request back to the server
fetch(window.location + "hello")
  .then( resp => resp.text())
  .then( text => console.log(text));
fetch(window.location + "flatmates/autocomplete/redfe")
  .then( resp => resp.json())
  .then( json => console.log(json));


async function getFlatmatesListings(req: ListingsRequest): Promise<ListingsResponse> {
    console.log(JSON.stringify(req));
    return fetch(window.location + "flatmates/listings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
    }).then(resp => resp.json())
}
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


function updateSearchSuggestions(suggestions: PlacesAutocompleteResult): void {
    const searchSuggestions = document.getElementById("search-suggestions")!;
    searchSuggestions.innerHTML = suggestions
      .results!
      .map((s) =>
          `<p class="suggest parambox click"
              data-lat="${s.lat}"
              data-lng="${s.lng}"
              >${s.description}</p>`
      )
      .reduce((s1: string, s2: string) => s1 + "\n" + s2)
    const suggestElems = searchSuggestions.getElementsByClassName("suggest");
    for (let i=0; i<suggestElems.length; i++) {
        suggestElems[i].addEventListener(
          'click',
          centreMapOnDestination as any
        );
    }
}

function centreMapOnDestination(ev: MouseEvent): void {
    const target = ev.target as HTMLParagraphElement;
    console.log(ev);
    const lat = parseFloat(target.dataset["lat"]!);
    const lng = parseFloat(target.dataset["lng"]!);
    centreMap(new Coord(lat, lng));
}

setTimeout( () => {
    console.log("Moving centre");
    centreMap(new Coord(-33.874176, 151.201148));
    setTimeout( () => {
        console.log("Moving centre back");
        centreMap(new Coord(-33.873176, 151.208148));
    }, 3000);
}, 3000);

let createMapMarker = (listing: FlatmatesListing) => (map: google.maps.Map) => {
    return new google.maps.Marker({
        position: { lat: listing.latitude, lng: listing.longitude },
        map: map,
        icon: orangeMarkerIcon(listing.rent[0]),
    })
};

async function updateListings() {
    const req = new ListingsRequest({
        boundingBox: getBounds().get()
    });
    console.log(req);

    const listings = await getFlatmatesListings(req);
    listings
      .matches
      .map( l => createMapMarker(l))
      .forEach( closure => addMapMarker(closure))
}

keepMapUpdated(updateListings);

let pageState = new FreeBrowse();
// user navigates to atlas -> tick
// google map with a default of sydney -> tick
// populate with map markers from flatmates.com.au results based on map geo bounds -> tick
// users can click flatmates price markers to see a flyout card and link -> TODO

// changes to zoom level issue a request to plot more markers flatmates map markers -> tick

// user starts typing a destination -> tick
// autocomplete provides a list of options -> tick
// user selects one of the options -> tick
// search bar collapses and turns into a "filters" menu -> TODO
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
