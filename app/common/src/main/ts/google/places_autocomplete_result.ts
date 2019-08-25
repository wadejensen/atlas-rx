export class PlacesAutocompleteResult {
  constructor(readonly results: PlacesAutocompleteEntry[]) {}
}

export class PlacesAutocompleteEntry {
  constructor(
    readonly description: string,
    readonly lat: number,
    readonly lng: number
  ) {}
}
