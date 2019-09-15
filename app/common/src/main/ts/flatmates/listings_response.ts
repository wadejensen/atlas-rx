import {TravelInfo} from "../google/distance_matrix";

export class ListingsResponse {
  constructor(readonly matches: Array<Listing>) {}
}

export class Listing {
  readonly location: ListingLocation;
  readonly traveTime?: TravelInfo;

  constructor(opts: {
    listingLocation: ListingLocation,
    travelTime?: TravelInfo,
  }) {
    this.location = opts.listingLocation;
    this.traveTime = opts.travelTime;
  }
}

export class ListingLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly rent: number;
  readonly subheading: string;
  readonly listingLink: string;
  readonly photo: string;

  constructor(opts: {
    latitude: number,
    longitude: number,
    rent: number,
    subheading: string,
    listingLink: string,
    photo: string,
  }) {
    this.latitude = opts.latitude;
    this.longitude = opts.longitude;
    this.rent = opts.rent;
    this.subheading = opts.subheading;
    this.listingLink = opts.listingLink;
    this.photo = opts.photo;
  }
}

export class FlatmatesListingsResponse {
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
