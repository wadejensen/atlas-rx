import { Preconditions } from "common/preconditions";

import {} from "googlemaps";
import {BoundingBox, Coord, Geo} from "../../../../common/src/main/ts/geo";
import {Try, TryCatch} from "../../../../common/src/main/ts/fp/try";
import LatLng = google.maps.LatLng;
import {FlatmatesListing} from "../../../../common/src/main/ts/flatmates/listings_response";
import {LossyThrottle} from "./lossy_throttle";
import Data = google.maps.Data;
import {getFlatmatesListings, googleDistanceMatrix} from "./endpoints";
import {collapseAll, getDestination, getFlatmatesCriteria} from "./content_update";
import {HTMLElementFactory} from "./html_elements";
import {
  TravelTimeRequest,
  TravelTimeResponse
} from "../../../../common/src/main/ts/google/distance_matrix";
import {LatLngLiteral} from "@google/maps";
import {Option} from "../../../../common/src/main/ts/fp/option";

declare var map: google.maps.Map;
var map_markers: google.maps.Data.Feature[] = [];

export class GoogleMap {
  // a single event listener for info window cards
  static infoWindowListener?: google.maps.MapsEventListener = undefined;
  static infoWindow?: google.maps.InfoWindow = undefined;
  static destinationMarker?: google.maps.Marker = undefined;

  static addEventListener(eventName: string, handler: () => any) {
    map.addListener(eventName, handler);
  }

  static async updateListings(): Promise<void> {
    const req = getFlatmatesCriteria();
    const listings = await getFlatmatesListings(req);
    GoogleMap.updateMap(listings.matches);
  }

  static updateMap(listings: Array<FlatmatesListing>): void {
    GoogleMap.clearMapMarkers();
    listings
      .map(GoogleMap.createMapMarker)
      .forEach(GoogleMap.addMapMarker);

    GoogleMap.setMapStyle();
    GoogleMap.infoWindowListener = map.data.addListener('click', GoogleMap.openWindow);
  }

  static openWindow = async (event: google.maps.Data.MouseEvent) => {
    // collapse any expanded search panes
    collapseAll();

    // close an existing info window if open
    if (GoogleMap.infoWindow != undefined) {
      GoogleMap.infoWindow.close();
    }

    const listing: FlatmatesListing = event.feature.getProperty("listing");
    // getTravelOptions
    const travelMode = "transit";
    const transitMode = "bus";

    // a destination may not be available
    const dest: Option<LatLngLiteral> = getDestination();
    const travelTimeReq: Option<TravelTimeRequest> = dest.map(d => new TravelTimeRequest({
      travelMode: travelMode,
      transitMode: transitMode,
      lat1: listing.latitude,
      lng1: listing.longitude,
      lat2: d.lat,
      lng2: d.lng,
    }));

    const travelTime = !travelTimeReq.isEmpty()
      ? googleDistanceMatrix(travelTimeReq.get())
      : Promise.resolve(new TravelTimeResponse({
        duration: "Requires destination",
        travelMode: travelMode,
      }));

    // const content = "";
    // if ()

    GoogleMap.infoWindow = new google.maps.InfoWindow({
      content: HTMLElementFactory.infoWindow(listing, dest, await travelTime),
      //disableAutoPan: true,
      position: {
        lat: listing.latitude,
        lng: listing.longitude,
      },
    });
    GoogleMap.infoWindow.open(map);
  };

  static addMapMarker(marker: Data.Feature): void {
    map_markers.push(marker);
    map.data.add(marker);
  }

  static clearMapMarkers() {
    while (map_markers.length > 0) {
      map.data.remove(map_markers.pop()!);
    }
    // avoid triggering multiple events when opening info windows
    if (GoogleMap.infoWindowListener != undefined) {
      google.maps.event.removeListener(GoogleMap.infoWindowListener);
    }
  }

  static createMapMarker(listing: FlatmatesListing): Data.Feature {
    return new Data.Feature({
      geometry: {
        lat: listing.latitude,
        lng: listing.longitude,
      },
      properties: {
        listing: listing,
      },
    });
  }

  static setMapStyle(): void {
    map.data.setStyle(feature => {
      const listing: FlatmatesListing = feature.getProperty("listing");
      return {
        icon: {
          url: `${orangeMarkerIcon(listing.rent[0])}`,
        }
      };
    });
  }

  static getBounds(): Try<BoundingBox> {
    return TryCatch( () => {
      const bounds = map.getBounds();
      return Geo.boundingBox(
        new Coord(bounds!.getNorthEast().lat(), bounds!.getNorthEast().lng()),
        new Coord(bounds!.getSouthWest().lat(), bounds!.getSouthWest().lng()),
      );
    }).recover((error) => {
      throw new Error(`Failed to get map geo bounding box: ${error}`)
    });
  }

  static setDestination(coord: Coord, zoomLevel: number = 16): void {
    if (GoogleMap.destinationMarker !== undefined) {
      GoogleMap.destinationMarker.setMap(null);
    }
    GoogleMap.destinationMarker = new google.maps.Marker({
      position: {
        lat: coord.lat,
        lng: coord.lon,
      },
      map: map,
      icon: "destination.svg",
    });

    map.setCenter(new LatLng(coord.lat, coord.lon));
    map.setZoom(zoomLevel)
  }
}

export class RGB {
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
export function markerIcon(price: number, fillRGB: RGB, outlineRGB: RGB): string {
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

export function orangeMarkerIcon(price: number) {
  return markerIcon(price, new RGB(220, 30, 20), new RGB(250, 50, 40));
}
