import {Preconditions} from "common/preconditions";

import {} from "googlemaps";
import {BoundingBox, Coord, Geo} from "../../../../common/src/main/ts/geo";
import {Try, TryCatch} from "../../../../common/src/main/ts/fp/try";
import {Listing} from "../../../../common/src/main/ts/flatmates/listings_response";
import {getListings, googleDistanceMatrix} from "./endpoints";
import {TravelInfo, TravelTimeRequest} from "../../../../common/src/main/ts/google/distance_matrix";
import {LatLngLiteral} from "@google/maps";
import {Option} from "../../../../common/src/main/ts/fp/option";
import {infoWindow} from "./dom/dom_element_factory";
import {getDestination, getExpensiveCriteria, getFreeCriteria} from "./dom/dom_element_reader";
import {collapseAll} from "./dom/dom_mutator";
import {getMap} from "./dom/dom_element_locator";
import {ListingsRequest} from "../../../../common/src/main/ts/listing";
import LatLng = google.maps.LatLng;
import Data = google.maps.Data;

const DISTANCE_MATRIX_REQUEST_COST = 0.01;

// Singleton encapsulating mutations to the state of the Google Map
export class GoogleMap {
  private static map: google.maps.Map;
  // a list of all currently displayed map markers
  private static map_markers: google.maps.Data.Feature[] = [];
  // state of the event listener for opening info window cards
  private static infoWindowListener?: google.maps.MapsEventListener = undefined;
  // state of the only allowed info window
  private static infoWindow?: google.maps.InfoWindow = undefined;
  // state of a single special map marker for the destination
  private static destinationMarker?: google.maps.Marker = undefined;

  static initMap() {
    GoogleMap.map = new google.maps.Map(getMap(), {
      center: {lat: -33.873176, lng: 151.208148},
      zoom: 16,
      gestureHandling: "cooperative",
      streetViewControl: false,
    });
  }

  static addEventListener(eventName: string, handler: () => any) {
    GoogleMap.map.addListener(eventName, handler);
  }

  // clear map of markers and replace with fresh flatmates listings
  static async updateFreeListings(): Promise<void> {
    // Expensive queries should only be triggered by directly clicking the search button
    const req: ListingsRequest = getExpensiveCriteria();
    if (!containsPremiumSearchCriteria(req)) {
      const freeReq: ListingsRequest = getFreeCriteria();
      const listings = await getListings(freeReq);
      GoogleMap.updateMap(listings.matches);
    }
  }

  static async updateExpensiveListings() {
    const freeReq: ListingsRequest = getFreeCriteria();
    const listings = await getListings(freeReq);

    const expensiveReq = getExpensiveCriteria();
    if (containsPremiumSearchCriteria(expensiveReq)) {
      const numDestinations = listings.matches.length;
      const cost = (numDestinations * DISTANCE_MATRIX_REQUEST_COST).toFixed(2);
      if (window.confirm(`
  You are about to trigger an API request that will cost $${cost}.
  Are you sure you wish to proceed?
  `)) {
        GoogleMap.map_markers.forEach(() => console.warn("Distance matrix request"));
        const filteredListings = await getListings(expensiveReq);
        GoogleMap.updateMap(filteredListings.matches);
      }
    } else {
      GoogleMap.updateMap(listings.matches);
    }
  }

  // centre map on specified location and place a waypoint to mark a coordinate
  // as the user's destination
  static setDestination(coord: Coord, zoomLevel: number = 16): void {
    if (GoogleMap.destinationMarker !== undefined) {
      GoogleMap.destinationMarker.setMap(null);
    }
    GoogleMap.destinationMarker = new google.maps.Marker({
      position: {
        lat: coord.lat,
        lng: coord.lon,
      },
      map: GoogleMap.map,
      icon: "destination.svg",
    });

    GoogleMap.map.setCenter(new LatLng(coord.lat, coord.lon));
    GoogleMap.map.setZoom(zoomLevel)
  }

  // replace map markers with new ones based on provided flatmates listings
  private static updateMap(listings: Array<Listing>): void {
    GoogleMap.clearMapMarkers();
    listings
      .map(GoogleMap.createMapMarker)
      .forEach(GoogleMap.addMapMarker);

    GoogleMap.setMapMarkerStyle();
    GoogleMap.infoWindowListener = GoogleMap.map.data
      .addListener('click', GoogleMap.openInfoWindow);
  }

  private static addMapMarker(marker: Data.Feature): void {
    GoogleMap.map_markers.push(marker);
    GoogleMap.map.data.add(marker);
  }

  static createMapMarker(listing: Listing): Data.Feature {
    return new Data.Feature({
      geometry: {
        lat: listing.location.latitude,
        lng: listing.location.longitude,
      },
      properties: {
        listing: listing,
      },
    });
  }

  private static clearMapMarkers() {
    while (GoogleMap.map_markers.length > 0) {
      GoogleMap.map.data.remove(GoogleMap.map_markers.pop()!);
    }
    // avoid triggering multiple events when opening info windows
    if (GoogleMap.infoWindowListener != undefined) {
      google.maps.event.removeListener(GoogleMap.infoWindowListener);
    }
  }

  private static openInfoWindow = async (event: google.maps.Data.MouseEvent) => {
    // collapse any expanded search panes
    collapseAll();

    // close an existing info window if open
    if (GoogleMap.infoWindow != undefined) {
      GoogleMap.infoWindow.close();
    }

    const listing: Listing = event.feature.getProperty("listing");
    const criteria = getExpensiveCriteria();

    // a user may not have specified a destination yet,
    // but we still need to show them an info card about a listing
    const dest: Option<LatLngLiteral> = getDestination();
    const travelTimeReq: Option<TravelTimeRequest> = dest.map(d => new TravelTimeRequest({
      travelMode: criteria.travelMode!,
      transitMode: criteria.transitMode,
      lat1: listing.location.latitude,
      lng1: listing.location.longitude,
      lat2: d.lat,
      lng2: d.lng,
    }));

    // switching from Option to Promise monad to handle async distance matrix request
    const travelTime: Promise<TravelInfo | undefined> = !travelTimeReq.isEmpty()
      ? googleDistanceMatrix(travelTimeReq.get())
      : Promise.resolve(undefined);

    GoogleMap.infoWindow = new google.maps.InfoWindow({
      content: infoWindow(listing, dest, await travelTime),
      //disableAutoPan: true,
      position: {
        lat: listing.location.latitude,
        lng: listing.location.longitude,
      },
    });
    GoogleMap.infoWindow.open(GoogleMap.map);
  };

  // bulk apply styling to all existing map markers
  private static setMapMarkerStyle(): void {
    GoogleMap.map.data.setStyle(feature => {
      const listing: Listing = feature.getProperty("listing");
      return {
        icon: {
          url: `${orangeMarkerIcon(listing.location.rent)}`,
        }
      };
    });
  }

  // returns the geo bounding box of the current extents of the Google Map
  static getBounds(): Try<BoundingBox> {
    return TryCatch( () => {
      const bounds = GoogleMap.map.getBounds();
      return Geo.boundingBox(
        new Coord(bounds!.getNorthEast().lat(), bounds!.getNorthEast().lng()),
        new Coord(bounds!.getSouthWest().lat(), bounds!.getSouthWest().lng()),
      );
    }).recover((error) => {
      throw new Error(`Failed to get map geo bounding box: ${error}`)
    });
  }
}

function containsPremiumSearchCriteria(criteria: ListingsRequest): boolean {
  return criteria.destination !== undefined &&
    (criteria.minTime !== undefined || criteria.maxTime !== undefined)
}

class RGB {
 constructor(readonly r: number, readonly g: number, readonly b: number) {}

 toHexString() {
   Preconditions.checkArgument(this.r >= 0 && this.r <= 255);
   Preconditions.checkArgument(this.g >= 0 && this.g <= 255);
   Preconditions.checkArgument(this.b >= 0 && this.b <= 255);
   return Math.floor(this.r).toString(16) +
     Math.floor(this.g).toString(16) +
     Math.floor(this.b).toString(16)
 }
}

/**
 * A clever hack of data uris to create non-standard map marker pins to display
 * on a Google map. Each marker is roughly rectangular with a pointer at the
 * bottom center, and contains the price as variable user input, prefixed by a
 * dollar sign. It looks something like this:
 *  _____________________________________________
 * |                                             |
 * |                                             |
 * |     _    __             _           __`     |
 * |    | |  / /  _ __  _ __(_) ___ ___  \ \`    |
 * |   / __)| |  | '_ \| '__| |/ __/ _ \  | |`   |
 * |   \__ < <   | |_) | |  | | (_|  __/   > >`  |
 * |   (   /| |  | .__/|_|  |_|\___\___|  | |`   |
 * |    |_|  \_\ |_|                     /_/`    |
 * |   `                                         |
 * |                                             |
 * |                                             |
 * |____________________      ___________________|
 *                      \    /
 *                       \  /
 *                        \/
 */
function markerIcon(price: number, fillRGB: RGB, outlineRGB: RGB): string {
    return "data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2250px%22%20" +
      "height%3D%2226px%22%20viewBox%3D%220%200%2050%2026%22%20xmlns%3D%22" +
      "http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20stroke%3D%22%23" +
      outlineRGB.toHexString() + "%22%20d%3D%22M30.6568542%2C20%20L50%2C20%20" +
      "L50%2C0%20L0%2C0%20L0%2C20%20L19.3431458%2C20%20L25%2C25.6568542%20" +
      "L30.6568542%2C20%20Z%22%20fill%3D%22%23" + fillRGB.toHexString() +
      "%22%3E%3C%2Fpath%3E%3Ctext%20text-anchor%3D%22middle%22%20font-family%3D" +
      "%22%26%23x27%3BOpen%20Sans%26%23x27%3B%2C%20sans-serif%22%20font-size%3D" +
      "%2214%22%20font-weight%3D%22500%22%20fill%3D%22white%22%20x%3D%2225%22" +
      "%20y%3D%2215%22%3E%24" + price.toString() + "%3C%2Ftext%3E%3C%2Fsvg%3E";
}

function orangeMarkerIcon(price: number) {
  return markerIcon(price, new RGB(220, 30, 20), new RGB(250, 50, 40));
}
