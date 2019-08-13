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
      readonly bottom_right: string
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
  ALL = "rooms",
  PRIVATE_ROOM = "private-room",
  SHARED_ROOM = "shared-room",
}

export class ListingsRequest {
  readonly boundingBox: BoundingBox;
  readonly roomType?: RoomType;
  readonly propertyTypes?: Array<PropertyType>;
  readonly minBudget?: number;
  readonly maxBudget?: number;

  constructor({
    boundingBox,
    roomType,
    propertyTypes,
    minBudget,
    maxBudget
  }: {
    boundingBox: BoundingBox,
    roomType?: RoomType,
    propertyTypes?: Array<PropertyType>,
    minBudget?: number,
    maxBudget?: number,
  }) {
    this.boundingBox = boundingBox;
    this.roomType = roomType;
    this.propertyTypes = propertyTypes;
    this.minBudget = minBudget;
    this.maxBudget = maxBudget;
  }
}

export class ListingsRequestBuilder {
  private boundingBox: BoundingBox;
  private roomType?: RoomType;
  private propertyTypes?: Array<PropertyType>;
  private minBudget?: number;
  private maxBudget?: number;

  constructor({
    boundingBox,
    roomType,
    propertyTypes,
    minBudget,
    maxBudget,
  }: {
      boundingBox: BoundingBox,
      roomType?: RoomType,
      propertyTypes?: Array<PropertyType>,
      minBudget?: number,
      maxBudget?: number,
  }) {
    this.boundingBox = boundingBox;
    this.roomType = roomType;
    this.propertyTypes = propertyTypes;
    this.minBudget = minBudget;
    this.maxBudget = maxBudget;
  }

  static builder(prototype: ListingsRequest): ListingsRequestBuilder {
    return new ListingsRequestBuilder({
      boundingBox: prototype.boundingBox,
      roomType: prototype.roomType,
      propertyTypes: prototype.propertyTypes,
      minBudget: prototype.minBudget,
      maxBudget: prototype.maxBudget,
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
    });
  }
}

export function mapListingsRequest(req: ListingsRequest): FlatmatesListingsRequest {
  return new FlatmatesListingsRequest(
    new Search(
    "rooms",
    req.roomType || null,
    req.propertyTypes || null,
    req.minBudget || 0,
    req.maxBudget || 10_000,
    `${req.boundingBox.topLeft.lat},${req.boundingBox.topLeft.lon}`,
    `${req.boundingBox.bottomRight.lat},${req.boundingBox.bottomRight.lon}`,
   ),
  );
}
