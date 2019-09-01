import {PlacesAutocompleteEntry} from "../../../../common/src/main/ts/google/places_autocomplete_result";
import {FlatmatesListing} from "../../../../common/src/main/ts/flatmates/listings_response";
import {TravelTimeResponse} from "../../../../common/src/main/ts/google/distance_matrix";
import {LatLngLiteral} from "@google/maps";

export class HTMLElementLocator {
  static getSearchBar(): HTMLInputElement {
    return document.getElementById("search")! as HTMLInputElement
  }

  static getSearchSuggestionsContainer(): HTMLDivElement {
    return document.getElementById("search-suggestions")! as HTMLDivElement
  }

  static getSearchSuggestions(): HTMLCollectionOf<Element> {
    const searchSuggestions = HTMLElementLocator.getSearchSuggestionsContainer();
    return searchSuggestions.getElementsByClassName("suggest")
  }

  static getSearchCriteria(): HTMLDivElement {
    return document.getElementById('search-criteria')! as HTMLDivElement
  }

  static getSearchButton(): HTMLButtonElement {
    return document.getElementById("search-button")! as HTMLButtonElement
  }
}

export class HTMLElementFactory {
  static searchSuggestion(suggestion: PlacesAutocompleteEntry) {
    return `<p class="suggest parambox click"
               data-lat="${suggestion.lat}"
               data-lng="${suggestion.lng}"
            >${suggestion.description}</p>`;
  }

  static infoWindow(
      listing: FlatmatesListing,
      destination: LatLngLiteral,
      travelTime: TravelTimeResponse
  ): string {
    const listingUrl = `https://flatmates.com.au${listing.listing_link}`;
    const directionsUrl = `https://www.google.com/maps/dir/${listing.latitude},${listing.longitude}/${destination.lat},${destination.lng}`;
    return `
<div class="info-window">
  <a class="info-window-title" href="${listingUrl}" target="_blank">${listing.subheading}</a>
  <a href="${listingUrl}" target="_blank">
    <img class="flatmates-photo" src="${listing.photo}">
  </a>
  <p class="info-window-details">Rent: <span>$${listing.rent[0]}</span></p>
  <a href="${directionsUrl}" target="_blank" class="info-window-details">Travel time: <span>${travelTime.duration} ${travelTime.travelMode}</span></a>
</div>
`;
  }
}

