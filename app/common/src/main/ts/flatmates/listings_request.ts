import {BoundingBox} from "../geo";

export class FlatmatesListingsRequest {
  constructor(readonly search: Search) {}
}

export class Search {
  constructor(
      readonly mode: string | null,
      readonly room: string | null,
      readonly property_types: Array<string> | null,
      readonly min_budget: number,
      readonly max_bucket: number,
      readonly top_left: string,
      readonly bottom_right: string,
      readonly furnishing: string | null,
      readonly bathroom_type: string | null,
      readonly parking: string | null,
  ) {}
}

export enum PropertyType {
  GRANNY_FLAT = "granny-flats",
  SHARE_HOUSE =  "share-houses",
  STUDENT_ACCOM = "student-accommodation",
  STUDIO = "studios",
  WHOLE_PROPERTY = "whole-properties",
  SINGLE_BEDROOM = "1-beds",
  HOMESTAY = "homestays",
}

export enum RoomType {
  PRIVATE_ROOM = "private-room",
  SHARED_ROOM = "shared-room",
}

export enum FurnishingType {
  FURNISHED = "furnished",
  UNFURNISHED = "unfurnished",
}

export enum BathroomType {
  ENSUITE = "ensuite",
  OWN_BATHROOM = "ensuite-or-own",
}

export enum ParkingType {
  NO_PARKING = "no-parking",
  ON_STREET = "on-street-parking",
  OFF_STREET = "off-street-parking"
}

export class ListingsRequest {
  readonly boundingBox: BoundingBox;
  readonly roomType?: RoomType;
  readonly propertyTypes?: Array<PropertyType>;
  readonly minBudget?: number;
  readonly maxBudget?: number;
  readonly furnishingType?: FurnishingType;
  readonly bathroomType?: BathroomType;
  readonly parkingType?: ParkingType;

  constructor({
    boundingBox,
    roomType,
    propertyTypes,
    minBudget,
    maxBudget,
    furnishingType,
    bathroomType,
    parkingType,
  }: {
    boundingBox: BoundingBox,
    roomType?: RoomType,
    propertyTypes?: Array<PropertyType>,
    minBudget?: number,
    maxBudget?: number,
    furnishingType?: FurnishingType,
    bathroomType?: BathroomType,
    parkingType?: ParkingType,
  }) {
    this.boundingBox = boundingBox;
    this.roomType = roomType;
    this.propertyTypes = propertyTypes;
    this.minBudget = minBudget;
    this.maxBudget = maxBudget;
    this.furnishingType = furnishingType;
    this.bathroomType = bathroomType;
    this.parkingType = parkingType;
  }
}

export class ListingsRequestBuilder {
  private boundingBox: BoundingBox;
  private roomType?: RoomType;
  private propertyTypes?: Array<PropertyType>;
  private minBudget?: number;
  private maxBudget?: number;
  private furnishingType?: FurnishingType;
  private bathroomType?: BathroomType;
  private parkingType?: ParkingType;

  constructor({
    boundingBox,
    roomType,
    propertyTypes,
    minBudget,
    maxBudget,
    furnishingType,
    bathroomType,
    parkingType,
  }: {
      boundingBox: BoundingBox,
      roomType?: RoomType,
      propertyTypes?: Array<PropertyType>,
      minBudget?: number,
      maxBudget?: number,
      furnishingType?: FurnishingType,
      bathroomType?: BathroomType,
      parkingType?: ParkingType,
  }) {
    this.boundingBox = boundingBox;
    this.roomType = roomType;
    this.propertyTypes = propertyTypes;
    this.minBudget = minBudget;
    this.maxBudget = maxBudget;
    this.furnishingType = furnishingType;
    this.bathroomType = bathroomType;
    this.parkingType = parkingType;
  }

  static builder(prototype: ListingsRequest): ListingsRequestBuilder {
    return new ListingsRequestBuilder({
      boundingBox: prototype.boundingBox,
      roomType: prototype.roomType,
      propertyTypes: prototype.propertyTypes,
      minBudget: prototype.minBudget,
      maxBudget: prototype.maxBudget,
      furnishingType: prototype.furnishingType,
      bathroomType: prototype.bathroomType,
      parkingType: prototype.parkingType,
    });
  }

  withBoundingBox(boundingBox: BoundingBox) {
    this.boundingBox = boundingBox;
    return this;
  }

  build(): ListingsRequest {
    return new ListingsRequest({
      boundingBox: this.boundingBox,
      roomType: this.roomType,
      propertyTypes: this.propertyTypes,
      minBudget: this.minBudget,
      maxBudget: this.maxBudget,
      furnishingType: this.furnishingType,
      bathroomType: this.bathroomType,
      parkingType: this.parkingType,
    });
  }
}

export function mapListingsRequest(req: ListingsRequest): FlatmatesListingsRequest {
  const search = new Search(
    "rooms",
    req.roomType || null,
    req.propertyTypes || null,
    req.minBudget || 0,
    req.maxBudget || 10_000,
    `${req.boundingBox.topLeft.lat},${req.boundingBox.topLeft.lon}`,
    `${req.boundingBox.bottomRight.lat},${req.boundingBox.bottomRight.lon}`,
    req.furnishingType || null,
    req.bathroomType || null,
    req.parkingType || null,
  );

  return new FlatmatesListingsRequest(removeUndefinedValues(search));
}

function removeUndefinedValues(o: any): any {
  let retval: { [key: string]: number | boolean | string } = {};
  for (const key of Object.keys(o)) {
    const value = o[key];
    if (value != null) {
      retval[key] = value;
    }
  }
  return retval;
}
