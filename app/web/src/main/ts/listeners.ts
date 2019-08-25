// creates triggers for user interactions which cause changes in PageState
import {collapseSearchBox, expandSearchBox} from "./state_transformations";
import {updateListings, updateSearchSuggestions} from "./content_update";
import {HTMLElementLocator} from "./html_elements";
import {centreMap, keepMapUpdated} from "./maps";
import {Coord} from "../../../../common/src/main/ts/geo";

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
  HTMLElementLocator.getSearchBar().addEventListener("focusin", expandSearchBox);
  HTMLElementLocator.getAlternateSearchBar().addEventListener("focusin", expandSearchBox);
  HTMLElementLocator.getSearchButton().addEventListener("click", collapseSearchBox);
  // TODO add a close button and corresponding listener
  HTMLElementLocator.getSearchBar().addEventListener("keyup", updateSearchSuggestions);
}

export function setupContentUpdateListeners() {
  setupPopulateMapListener();
  setupSearchAutocompleteListeners();
}

function setupPopulateMapListener(): void {
  keepMapUpdated(updateListings);
}

function setupSearchAutocompleteListeners(): void {
  HTMLElementLocator.getSearchBar().addEventListener("keyup", updateSearchSuggestions);
  HTMLElementLocator.getSearchBar().addEventListener("keyup", (ev: KeyboardEvent) => {
    if (ev.key == "Enter") {
      const topResult = HTMLElementLocator.getSearchSuggestions()[0] as HTMLParagraphElement;
      const lat = parseFloat(topResult.dataset["lat"]!);
      const lng = parseFloat(topResult.dataset["lng"]!);

      // TODO(wadejensen) switch to transitioning to CriteriaRefine state.
      collapseSearchBox();
      centreMap(new Coord(lat, lng));
    }
  });
}

export function registerSuggestionListener(suggestion: HTMLParagraphElement): void {
  suggestion.addEventListener('click', (ev: MouseEvent) => {
    const target = ev.target as HTMLParagraphElement;
    const lat = parseFloat(target.dataset["lat"]!);
    const lng = parseFloat(target.dataset["lng"]!);
    centreMap(new Coord(lat, lng));
  })
}
