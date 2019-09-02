// creates triggers for user interactions which cause changes in PageState
import {
  collapseAll,
  collapseExpensiveSearchCriteria,
  collapseSearchCriteria,
  collapseSearchSuggestions, expandExpensiveSearchCriteria,
  expandSearchCriteria,
  expandSearchSuggestions,
  hideRefineButton,
  interstitialSearchPlaceholder,
  resetSearchPlaceholder,
  showRefineButton,
  updateSearchSuggestions,
} from "./content_update";
import {HTMLElementLocator} from "./html_elements";
import {Coord} from "../../../../common/src/main/ts/geo";
import {GoogleMap} from "./maps";
import {LossyThrottle} from "./lossy_throttle";

/** Page state machine
 *
 *      |-> Free
 *      |   browse
 *      |     |
 *      |     ▼
 *      |__ Destination
 *      |   select
 *      |     |
 *      |     ▼
 *      |__ Criteria <-
 *      |   refine    |
 *      |     |       |
 *      |     ▼       |
 *      |__ Refined __|
 *          browse
 *
 *       Free browse
 *         * The initial state.
 *         * User may browse Google map to see flatmates.com.au results
 *         * No filtering of search results
 *         * No travel time information in map marker flyout cards
 *
 *       Destination select
 *         * User has clicked the search bar
 *         * User can start typing a destination to receive suggestions
 *         * When a user selects a destination the Google map centres on the destination and
 *            the "critera refine" menu expands
 *
 *       Criteria refine
 *         * User can set their travel mode (car, public transit, etc)
 *         * User can set their requirements for:
 *            rent, accommodation type, room type, bathroom type, parking
 *         * Use can click the search button to close the "criteria refine" menu and
 *            view the whole populated Google map
 *
 *       Refined browse
 *         * Use can browse the Google map to see flatmates.com.au results
 *         * User may click map markers to see travel time information
 *         * User may reopen the criteria refine menu to refine their search
 *
 **/

export function setupStateChangeListeners(): void {
  HTMLElementLocator.getSearchBar().addEventListener("focusin", () => {
    interstitialSearchPlaceholder();
    collapseSearchCriteria();
    collapseExpensiveSearchCriteria();
    expandSearchSuggestions();
  });

  HTMLElementLocator.getSearchButton().addEventListener("click", () => {
    resetSearchPlaceholder();
    collapseSearchSuggestions();
    collapseSearchCriteria();
    GoogleMap.updateListings();
  });

  HTMLElementLocator.getRefineButton().addEventListener("click", () => {
    expandSearchCriteria();
  });

  HTMLElementLocator.getSearchBar().addEventListener("keyup", updateSearchSuggestions);

  HTMLElementLocator.getExpensiveRefineButton().addEventListener("click", expandExpensiveSearchCriteria);
  HTMLElementLocator.getExpensiveSearchButton().addEventListener("click", collapseExpensiveSearchCriteria);

  // when the map is clicked, close all expanded input menus
  GoogleMap.addEventListener("click", collapseAll);
}

export function setupContentUpdateListeners() {
  setupPopulateMapListener();
  setupSearchAutocompleteListeners();
}

function setupPopulateMapListener(): void {
  const throttle = new LossyThrottle(1);
  GoogleMap.addEventListener('bounds_changed',
    () => throttle.apply(GoogleMap.updateListings));
}

function setupSearchAutocompleteListeners(): void {
  HTMLElementLocator.getSearchBar().addEventListener("keyup", updateSearchSuggestions);
  HTMLElementLocator.getSearchBar().addEventListener("keyup", (ev: KeyboardEvent) => {
    if (ev.key == "Enter") {
      const topResult = HTMLElementLocator.getSearchSuggestions()[0] as HTMLParagraphElement;
      const lat = parseFloat(topResult.dataset["lat"]!);
      const lng = parseFloat(topResult.dataset["lng"]!);

      GoogleMap.setDestination(new Coord(lat, lng));
    }
  });
}

export function registerSuggestionListener(suggestion: HTMLParagraphElement): void {
  suggestion.addEventListener('click', (ev: MouseEvent) => {
    const target = ev.target as HTMLParagraphElement;

    // set search bar content to selected search suggestion
    const searchBar = HTMLElementLocator.getSearchBar();
    searchBar.value = target.innerText;

    // parse coords from suggestion
    const lat = parseFloat(suggestion.dataset["lat"]!);
    const lng = parseFloat(suggestion.dataset["lng"]!);

    searchBar.setAttribute("data-lat", lat.toString());
    searchBar.setAttribute("data-lng", lng.toString());

    // and centre Google Map on suggestion
    GoogleMap.setDestination(new Coord(lat, lng));
    collapseSearchSuggestions();
  })
}
