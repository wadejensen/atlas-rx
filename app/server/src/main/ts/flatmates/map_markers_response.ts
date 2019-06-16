export class MapMarkersResponse {
  readonly matches: Array<FlatmatesListing>;
  readonly non_matches: Array<FlatmatesListing>;

  constructor(opts: {
    matches: Array<FlatmatesListing>,
    non_matches: Array<FlatmatesListing>,
  }) {
    this.matches = opts.matches;
    this.non_matches = opts.non_matches;
  }
}

export class FlatmatesListing {
  readonly head: string;
  readonly subheading: string;
  readonly photo: string;
  readonly listing_link: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly rent: Array<number>;
  readonly id: number;
  readonly type: string;

  constructor(opts: {
    head: string,
    subheading: string,
    photo: string,
    listing_link: string,
    latitude: number,
    longitude: number,
    rent: Array<number>,
    id: number,
    type: string,
  }) {
    this.head = opts.head;
    this.subheading = opts.subheading;
    this.photo = opts.photo;
    this.listing_link = opts.listing_link;
    this.latitude = opts.latitude;
    this.longitude = opts.longitude;
    this.rent = opts.rent;
    this.id = opts.id;
    this.type = opts.type;
  }
}
