export class HTMLElementLocator {
  static getSearchBar(): HTMLInputElement {
    return document.getElementById("search1")! as HTMLInputElement
  }

  static getAlternateSearchBar(): HTMLInputElement {
    return document.getElementById("search2")! as HTMLInputElement
  }

  static getSearchSuggestionsContainer(): HTMLDivElement {
    return document.getElementById("search-suggestions")! as HTMLDivElement
  }

  static getSearchSuggestions(): HTMLCollectionOf<Element> {
    const searchSuggestions = HTMLElementLocator.getSearchSuggestionsContainer();
    return searchSuggestions.getElementsByClassName("suggest")
  }

  static getSearchExpand(): HTMLDivElement {
    return document.getElementById('search-expand')! as HTMLDivElement
  }

  static getSearchButton(): HTMLButtonElement {
    return document.getElementById("search-button")! as HTMLButtonElement
  }
}

