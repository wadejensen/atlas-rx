export class AutocompleteRequest {
  constructor(readonly location_suggest: LocationSuggest) {}
}

export class LocationSuggest {
  constructor(
    readonly text: string,
    readonly completion: Completion,
  ) {}
}

export class Completion {
  constructor(
    readonly field: string,
    readonly size: number,
    readonly fuzzy: Fuzzy,
    readonly contexts: Contexts) {}
}

export class Fuzzy {
  constructor(readonly fuzziness: string) {}
}

export class Contexts {
  constructor(readonly location_type: Array<string>) {}
}
