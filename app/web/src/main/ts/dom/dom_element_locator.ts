export function getMap(): HTMLDivElement {
  return document.getElementById('map') as HTMLDivElement;
}

export function getSearchBar(): HTMLInputElement {
  return document.getElementById("search")! as HTMLInputElement
}

export function getSearchSuggestionsContainer(): HTMLDivElement {
  return document.getElementById("search-suggestions")! as HTMLDivElement
}

export function getSearchSuggestions(): HTMLCollectionOf<Element> {
  const searchSuggestions = getSearchSuggestionsContainer();
  return searchSuggestions.getElementsByClassName("suggest")
}

export function getSearchCriteria(): HTMLDivElement {
  return document.getElementById('search-criteria')! as HTMLDivElement
}

export function getSearchButton(): HTMLButtonElement {
  return document.getElementById("search-button")! as HTMLButtonElement
}

export function getRefineButton() {
  return document.getElementById("refine-button")! as HTMLImageElement
}

export function getExpensiveRefineButton() {
  return document.getElementById("expensive-refine-button")! as HTMLDivElement
}

export function getExpensiveSearchCriteria() {
  return document.getElementById("expensive-search-criteria")! as HTMLDivElement
}

export function getExpensiveSearchButton() {
  return document.getElementById("expensive-search-button")! as HTMLButtonElement
}

