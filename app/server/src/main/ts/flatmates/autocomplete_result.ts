export class AutocompleteResponse {
  constructor(readonly query: string, readonly results: Array<AutocompleteResult>) {}
}

export class AutocompleteResult {
  readonly text: string;
  readonly state: string;
  readonly city: string;
  readonly suburb: string;
  readonly postcode: string;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly location_type: string;
  readonly average_rent: number;
  readonly name: string | null;
  readonly short_name: string | null;
  readonly search_title: string;
  readonly short_title: string;

  constructor(opts: {
    text: string,
    state: string,
    city: string,
    suburb: string,
    postcode: string,
    country: string,
    latitude: number,
    longitude: number,
    location_type: string,
    average_rent: number,
    name: string | null,
    short_name: string | null,
    search_title: string,
    short_title: string,
  }) {
    this.text = opts.text;
    this.state = opts.state;
    this.city = opts.city;
    this.suburb = opts.suburb;
    this.postcode = opts.postcode;
    this.country = opts.country;
    this.latitude = opts.latitude;
    this.longitude = opts.longitude;
    this.location_type = opts.location_type;
    this.average_rent = opts.average_rent;
    this.name = opts.name;
    this.short_name = opts.short_name;
    this.search_title = opts.search_title;
    this.short_title = opts.short_title;
  }
}
