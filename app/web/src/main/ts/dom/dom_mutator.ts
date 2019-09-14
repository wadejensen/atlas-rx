import {
  getExpensiveRefineButton,
  getExpensiveSearchCriteria,
  getRefineButton,
  getSearchBar, getSearchCriteria,
  getSearchSuggestions,
  getSearchSuggestionsContainer
} from "./dom_element_locator";
import {TryCatch} from "../../../../../common/src/main/ts/fp/try";
import {googlePlacesAutocomplete} from "../endpoints";
import {PlacesAutocompleteResult} from "../../../../../common/src/main/ts/google/places_autocomplete_result";
import {registerSuggestionListener} from "../listeners";
import {searchSuggestion} from "./dom_element_factory";

export async function updateSearchSuggestions(): Promise<void> {
  TryCatch(async () => {
    const query = getSearchBar().value;
    if (query != "") {
      const suggestions = await googlePlacesAutocomplete(query);
      populateSearchSuggestions(suggestions)
    } else {
      // hide the suggestions
      getSearchSuggestionsContainer().innerHTML = "";
    }
  })
}

function populateSearchSuggestions(suggestions: PlacesAutocompleteResult): void {
  const searchSuggestions = getSearchSuggestionsContainer();
  searchSuggestions.innerHTML = suggestions
    .results!
    .map(searchSuggestion)
    .reduce((s1: string, s2: string) => s1 + "\n" + s2);
  const suggestElems = getSearchSuggestions();
  for (let i=0; i<suggestElems.length; i++) {
    registerSuggestionListener(suggestElems[i] as HTMLParagraphElement);
  }
}

export function expandSearchSuggestions(): void {
  let searchSuggestions = getSearchSuggestionsContainer();
  showElement(searchSuggestions);
}

export function collapseSearchSuggestions(): void {
  let searchSuggestions = getSearchSuggestionsContainer();
  hideElement(searchSuggestions);
}

export function expandSearchCriteria() {
  collapseAll();
  hideRefineButton();
  let searchCriteria = getSearchCriteria();
  searchCriteria.className = "search-criteria";
  searchCriteria.parentElement!.classList.remove("search-container-hidden");
}

export function collapseSearchCriteria(): any {
  let searchCriteria = getSearchCriteria();
  searchCriteria.className = "search-criteria-hidden";
  searchCriteria.parentElement!.classList.add("search-container-hidden");
  showRefineButton();
  resetSearchPlaceholder();
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
  updateSearchPlaceholder("Search rooms near: \u00A0\u00A0\u00A0👔\u00A0/\u00A0🏫\u00A0/\u00A0👪");
}

export function interstitialSearchPlaceholder() {
  updateSearchPlaceholder("Where do you commute to?");
}

function updateSearchPlaceholder(placeholder: string): void {
  let searchBar = getSearchBar();
  searchBar.placeholder = placeholder;
}

export function showRefineButton() {
  getRefineButton().classList.remove("refine-hidden");
  getRefineButton().classList.add("refine");}

export function hideRefineButton() {
  getRefineButton().classList.remove("refine");
  getRefineButton().classList.add("refine-hidden");
}

export function expandExpensiveSearchCriteria() {
  collapseAll();
  hideExpensiveRefineButton();
  let searchCriteria = getExpensiveSearchCriteria();
  searchCriteria.className = "search-criteria";
  searchCriteria.parentElement!.classList.remove("expensive-search-container-hidden");
}

export function collapseExpensiveSearchCriteria(): any {
  let searchCriteria = getExpensiveSearchCriteria();
  searchCriteria.className = "search-criteria-hidden";
  searchCriteria.parentElement!.classList.add("expensive-search-container-hidden");
  showExpensiveRefineButton();
  resetSearchPlaceholder();
}

export function showExpensiveRefineButton() {
  getExpensiveRefineButton().classList.remove("refine-hidden");
  getExpensiveRefineButton().classList.add("refine");
}

export function hideExpensiveRefineButton() {
  getExpensiveRefineButton().classList.remove("refine");
  getExpensiveRefineButton().classList.add("refine-hidden");
}

export function collapseAll() {
  collapseSearchSuggestions();
  collapseSearchCriteria();
  collapseExpensiveSearchCriteria();
}
