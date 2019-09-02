import {PlacesAutocompleteEntry} from "../../../../../common/src/main/ts/google/places_autocomplete_result";
import {FlatmatesListing} from "../../../../../common/src/main/ts/flatmates/listings_response";
import {Option} from "../../../../../common/src/main/ts/fp/option";
import {LatLngLiteral} from "@google/maps";
import {TravelTimeResponse} from "../../../../../common/src/main/ts/google/distance_matrix";

export function searchSuggestion(suggestion: PlacesAutocompleteEntry) {
  return `<p class="suggest parambox click"
             data-lat="${suggestion.lat}"
             data-lng="${suggestion.lng}"
          >${suggestion.description}</p>`;
}

export function infoWindow(
  listing: FlatmatesListing,
  destination: Option<LatLngLiteral>,
  travelTime: TravelTimeResponse,
): string {
  if (destination.isEmpty()) {
    return infoWindowContent(listing);
  } else {
    return infoWindowContentWithDestination(listing,
      destination.get(), travelTime);
  }
}

function infoWindowContent(listing: FlatmatesListing) {
  const listingUrl = `https://flatmates.com.au${listing.listing_link}`;
  return `
<div class="info-window">
  <a class="info-window-title" href="${listingUrl}" target="_blank">${listing.subheading}</a>
  <a href="${listingUrl}" target="_blank">
    <img class="flatmates-photo" src="${listing.photo}">
  </a>
  <p class="info-window-details">Rent: <span>$${listing.rent[0]}</span></p>
  <p class="info-window-details">Travel time: <span>???</span></p>
</div>
`;
}

function infoWindowContentWithDestination(
  listing: FlatmatesListing,
  destination: LatLngLiteral,
  travelTime: TravelTimeResponse
) {
  const listingUrl = `https://flatmates.com.au${listing.listing_link}`;
  const directionsUrl = `https://www.google.com/maps/dir/${listing.latitude},${listing.longitude}/${destination.lat},${destination.lng}`;

  return `
<div class="info-window">
  <a class="info-window-title" href="${listingUrl}" target="_blank">${listing.subheading}</a>
  <a href="${listingUrl}" target="_blank">
    <img class="flatmates-photo" src="${listing.photo}">
  </a>
  <p class="info-window-details">Rent: <span>$${listing.rent[0]}</span></p>
  <a href="${directionsUrl}" target="_blank" class="info-window-details">Travel time: <span>${travelTime.duration} (${travelTime.travelMode})</span></a>
</div>
`;
}
