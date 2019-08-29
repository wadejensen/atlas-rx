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
