import {HTMLElementLocator} from "./html_elements";

export function expandSearchBox(): any {
  console.log("expand");
  let searchExpand = HTMLElementLocator.getSearchExpand();
  let search = HTMLElementLocator.getSearchBar();
  let searchSuggestions = HTMLElementLocator.getSearchSuggestionsContainer();

  showElement(searchExpand);
  showElement(search);
  showElement(searchSuggestions);
}

export function collapseSearchBox(): any {
  console.log("collapse");

  let searchExpand = HTMLElementLocator.getSearchExpand();
  let search = HTMLElementLocator.getSearchBar();
  let searchSuggestions = HTMLElementLocator.getSearchSuggestionsContainer();

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
