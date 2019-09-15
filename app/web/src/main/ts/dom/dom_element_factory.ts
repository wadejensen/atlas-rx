import {PlacesAutocompleteEntry} from "../../../../../common/src/main/ts/google/places_autocomplete_result";
import {Listing} from "../../../../../common/src/main/ts/flatmates/listings_response";
import {Option} from "../../../../../common/src/main/ts/fp/option";
import {LatLngLiteral, TransitMode, TravelMode} from "@google/maps";
import {TravelInfo} from "../../../../../common/src/main/ts/google/distance_matrix";

export function searchSuggestion(suggestion: PlacesAutocompleteEntry) {
  return `<p class="suggest parambox click"
             data-lat="${suggestion.lat}"
             data-lng="${suggestion.lng}"
          >${suggestion.description}</p>`;
}

export function infoWindow(
  listing: Listing,
  destination: Option<LatLngLiteral>,
  travelTime?: TravelInfo,
): string {
  if (destination.isEmpty()) {
    return infoWindowContent(listing);
  } else {
    return infoWindowContentWithDestination(listing,
      destination.get(), travelTime!);
  }
}

function infoWindowContent(listing: Listing) {
  const listingLocation = listing.location;
  const listingUrl = `https://flatmates.com.au${listingLocation.listingLink}`;
  return `
<div class="info-window">
  <a class="info-window-title" href="${listingUrl}" target="_blank">${listingLocation.subheading}</a>
  <a href="${listingUrl}" target="_blank">
    <img class="flatmates-photo" src="${listingLocation.photo}">
  </a>
  <p class="info-window-details">Rent: <span>$${listingLocation.rent}</span></p>
  <p class="info-window-details">Travel time: <span>???</span></p>
</div>
`;
}

function infoWindowContentWithDestination(
  listing: Listing,
  destination: LatLngLiteral,
  travelTime: TravelInfo
) {
  const listingLocation = listing.location;
  const listingUrl = `https://flatmates.com.au${listingLocation.listingLink}`;
  const directionsUrl = `https://www.google.com/maps/dir/${listingLocation.latitude},${listingLocation.longitude}/${destination.lat},${destination.lng}`;

  return `
<div class="info-window">
  <a class="info-window-title" href="${listingUrl}" target="_blank">${listingLocation.subheading}</a>
  <a href="${listingUrl}" target="_blank">
    <img class="flatmates-photo" src="${listingLocation.photo}">
  </a>
  <p class="info-window-details">Rent: <span>$${listingLocation.rent}</span></p>
  <a href="${directionsUrl}" target="_blank" class="info-window-details">Travel time: <span>${travelTime.durationDisplay} ${travelModeIcon(travelTime.travelMode, travelTime.transitMode)}</span></a>
</div>
`;
}

function travelModeIcon(
  travelMode: TravelMode | undefined,
  transitMode: TransitMode | undefined
): string {
  if (travelMode === undefined || travelMode == "driving") {
    return "🚗";
  } else if (travelMode === "bicycling") {
    return "🚲";
  } else if (travelMode === "walking") {
    return "🚶";
  } else if (travelMode === "transit") {
    if (transitMode === undefined) {
      return "🚈🚌⛴"
    } else if (transitMode === "rail") {
        return "🚈";
    } else if (transitMode === "bus") {
        return "🚌";
    } else {
      throw new Error(`Unrecognised transit mode: ${transitMode}`);
    }
  } else {
    throw new Error(`Unrecognised travel mode: ${travelMode}`);
  }
}
