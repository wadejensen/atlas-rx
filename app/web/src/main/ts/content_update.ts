import {TryCatch} from "../../../../common/src/main/ts/fp/try";
import {getFlatmatesListings, googlePlacesAutocomplete} from "./endpoints";
import {PlacesAutocompleteResult} from "../../../../common/src/main/ts/google/places_autocomplete_result";
import {addMapMarker, centreMap, createMapMarker, getBounds} from "./maps";
import {ListingsRequest} from "../../../../common/src/main/ts/flatmates/listings_request";
import {HTMLElementLocator} from "./html_elements";
import {registerSuggestionListener} from "./listeners";

export async function updateListings(): Promise<void> {
  const req = new ListingsRequest({
    boundingBox: getBounds().get()
  });
  console.log(req);

  const listings = await getFlatmatesListings(req);
  listings
    .matches
    .map( l => createMapMarker(l))
    .forEach( closure => addMapMarker(closure))
}

export async function updateSearchSuggestions(): Promise<void> {
  TryCatch( async () => {
    const query = HTMLElementLocator.getSearchBar().value;
    if (query != "") {
      const suggestions = await googlePlacesAutocomplete(query);
      console.log(suggestions);
      populateSearchSuggestions(suggestions)
    }
  })
}

function populateSearchSuggestions(suggestions: PlacesAutocompleteResult): void {
  const searchSuggestions = HTMLElementLocator.getSearchSuggestionsContainer();
  searchSuggestions.innerHTML = suggestions
    .results!
    .map((s) =>
      `<p class="suggest parambox click"
              data-lat="${s.lat}"
              data-lng="${s.lng}"
              >${s.description}</p>`
    )
    .reduce((s1: string, s2: string) => s1 + "\n" + s2);
  const suggestElems = HTMLElementLocator.getSearchSuggestions();
  for (let i=0; i<suggestElems.length; i++) {
    registerSuggestionListener(suggestElems[i] as HTMLParagraphElement);
  }
}
