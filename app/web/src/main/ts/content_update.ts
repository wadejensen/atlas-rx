import {TryCatch} from "../../../../common/src/main/ts/fp/try";
import {googlePlacesAutocomplete} from "./endpoints";
import {PlacesAutocompleteResult} from "../../../../common/src/main/ts/google/places_autocomplete_result";
import {
  BathroomType,
  FurnishingType,
  ListingsRequest,
  ParkingType,
  RoomType
} from "../../../../common/src/main/ts/flatmates/listings_request";
import {HTMLElementFactory, HTMLElementLocator} from "./html_elements";
import {registerSuggestionListener} from "./listeners";
import {GoogleMap} from "./maps";
import {None, Option, Some} from "../../../../common/src/main/ts/fp/option";
import LatLngLiteral = google.maps.LatLngLiteral;

export function getFlatmatesCriteria(): ListingsRequest {
  return new ListingsRequest({
    boundingBox: GoogleMap.getBounds().get(),
    minBudget: parseInt(getInputFieldValue("min-rent")) || undefined,
    maxBudget: parseInt(getInputFieldValue("max-rent")) || undefined,
    roomType: getInputFieldValue("room-type") as RoomType || undefined,
    furnishingType: getInputFieldValue("furnishing-type") as FurnishingType || undefined,
    bathroomType: getInputFieldValue("bathroom-type") as BathroomType || undefined,
    parkingType: getInputFieldValue("parking-type") as ParkingType || undefined,
  });
}

export function getDestination(): Option<LatLngLiteral> {
  const searchBar = HTMLElementLocator.getSearchBar()!;

  const lat = parseFloat(searchBar.dataset["lat"]!);
  const lng = parseFloat(searchBar.dataset["lng"]!);

  if (lat === undefined || Number.isNaN(lat) || lng === undefined || Number.isNaN(lng)) {
    return new None<LatLngLiteral>();
  } else {
    return new Some({
      lat: lat,
      lng: lng,
    });
  }
}

function getInputFieldValue(id: string) {
  return (document.getElementById(id) as HTMLInputElement).value
}

export async function updateSearchSuggestions(): Promise<void> {
  TryCatch(async () => {
    const query = HTMLElementLocator.getSearchBar().value;
    if (query != "") {
      const suggestions = await googlePlacesAutocomplete(query);
      populateSearchSuggestions(suggestions)
    } else {
      // hide the suggestions
      HTMLElementLocator.getSearchSuggestionsContainer().innerHTML = "";
    }
  })
}

function populateSearchSuggestions(suggestions: PlacesAutocompleteResult): void {
  const searchSuggestions = HTMLElementLocator.getSearchSuggestionsContainer();
  searchSuggestions.innerHTML = suggestions
    .results!
    .map(HTMLElementFactory.searchSuggestion)
    .reduce((s1: string, s2: string) => s1 + "\n" + s2);
  const suggestElems = HTMLElementLocator.getSearchSuggestions();
  for (let i=0; i<suggestElems.length; i++) {
    registerSuggestionListener(suggestElems[i] as HTMLParagraphElement);
  }
}

export function expandSearchSuggestions(): void {
  let searchSuggestions = HTMLElementLocator.getSearchSuggestionsContainer();
  showElement(searchSuggestions);
}

export function collapseSearchSuggestions(): void {
  let searchSuggestions = HTMLElementLocator.getSearchSuggestionsContainer();
  hideElement(searchSuggestions);
}

export function expandSearchCriteria() {
  collapseExpensiveSearchCriteria();
  hideRefineButton();
  let searchCriteria = HTMLElementLocator.getSearchCriteria();
  searchCriteria.className = "search-criteria";
  searchCriteria.parentElement!.classList.remove("search-container-hidden");
}

export function collapseSearchCriteria(): any {
  let searchCriteria = HTMLElementLocator.getSearchCriteria();
  searchCriteria.className = "search-criteria-hidden";
  searchCriteria.parentElement!.classList.add("search-container-hidden")
  showRefineButton();
}

function showElement(element: HTMLElement): void {
  element.style.display="flex";
  element.style.zIndex="2";
}

function hideElement(element: HTMLElement): void {
  element.style.display = "none";
  element.style.zIndex = "-1";
}

export function resetSearchPlaceholder() {
  updateSearchPlaceholder("Search rooms near: \u00A0\u00A0\u00A0👔\u00A0/\u00A0🏫\u00A0/\u00A0/👪");
}

export function interstitialSearchPlaceholder() {
  updateSearchPlaceholder("Where do you commute to?");
}

function updateSearchPlaceholder(placeholder: string): void {
  let searchBar = HTMLElementLocator.getSearchBar();
  searchBar.placeholder = placeholder;
}

export function showRefineButton() {
  HTMLElementLocator.getRefineButton().classList.remove("refine-hidden");
  HTMLElementLocator.getRefineButton().classList.add("refine");}

export function hideRefineButton() {
  HTMLElementLocator.getRefineButton().classList.remove("refine");
  HTMLElementLocator.getRefineButton().classList.add("refine-hidden");
}

export function expandExpensiveSearchCriteria() {
  collapseSearchCriteria();
  hideExpensiveRefineButton();
  let searchCriteria = HTMLElementLocator.getExpensiveSearchCriteria();
  searchCriteria.className = "search-criteria";
  searchCriteria.parentElement!.classList.remove("expensive-search-container-hidden");
}

export function collapseExpensiveSearchCriteria(): any {
  let searchCriteria = HTMLElementLocator.getExpensiveSearchCriteria();
  searchCriteria.className = "search-criteria-hidden";
  searchCriteria.parentElement!.classList.add("expensive-search-container-hidden");
  showExpensiveRefineButton()
}

export function showExpensiveRefineButton() {
  HTMLElementLocator.getExpensiveRefineButton().classList.remove("refine-hidden");
  HTMLElementLocator.getExpensiveRefineButton().classList.add("refine");
}

export function hideExpensiveRefineButton() {
  HTMLElementLocator.getExpensiveRefineButton().classList.remove("refine");
  HTMLElementLocator.getExpensiveRefineButton().classList.add("refine-hidden");
}

export function collapseAll() {
  collapseSearchSuggestions();
  collapseSearchCriteria();
  collapseExpensiveSearchCriteria();
}
