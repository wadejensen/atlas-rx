import {BoundingBox} from "./geo";
import {
  BathroomType, FlatmatesListingsRequest,
  FurnishingType,
  ParkingType,
  PropertyType,
  RoomType, Search
} from "./flatmates/listings_request";
import {TransitMode, TravelMode} from "@google/maps";

export class ListingsRequest {
  readonly boundingBox: BoundingBox;
  readonly roomType?: RoomType;
  readonly propertyTypes?: Array<PropertyType>;
  readonly minBudget?: number;
  readonly maxBudget?: number;
  readonly furnishingType?: FurnishingType;
  readonly bathroomType?: BathroomType;
  readonly parkingType?: ParkingType;
  readonly minTime?: number;
  readonly maxTime?: number;
  readonly travelMode?: TravelMode;
  readonly transitMode?: TransitMode;

  constructor({
    boundingBox,
    roomType,
    propertyTypes,
    minBudget,
    maxBudget,
    furnishingType,
    bathroomType,
    parkingType,
    minTime,
    maxTime,
    travelMode,
    transitMode,
  }: {
    boundingBox: BoundingBox,
    roomType?: RoomType,
    propertyTypes?: Array<PropertyType>,
    minBudget?: number,
    maxBudget?: number,
    furnishingType?: FurnishingType,
    bathroomType?: BathroomType,
    parkingType?: ParkingType,
    minTime?: number,
    maxTime?: number,
    travelMode?: TravelMode,
    transitMode?: TransitMode,
  }) {
    this.boundingBox = boundingBox;
    this.roomType = roomType;
    this.propertyTypes = propertyTypes;
    this.minBudget = minBudget;
    this.maxBudget = maxBudget;
    this.furnishingType = furnishingType;
    this.bathroomType = bathroomType;
    this.parkingType = parkingType;
    this.minTime = minTime;
    this.maxTime = maxTime;
    this.travelMode = travelMode;
    this.transitMode = transitMode;
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
  private readonly minTime?: number;
  private readonly maxTime?: number;
  private readonly travelMode?: TravelMode;
  private readonly transitMode?: TransitMode;

  constructor({
    boundingBox,
    roomType,
    propertyTypes,
    minBudget,
    maxBudget,
    furnishingType,
    bathroomType,
    parkingType,
    minTime,
    maxTime,
    travelMode,
    transitMode,
  }: {
    boundingBox: BoundingBox,
    roomType?: RoomType,
    propertyTypes?: Array<PropertyType>,
    minBudget?: number,
    maxBudget?: number,
    furnishingType?: FurnishingType,
    bathroomType?: BathroomType,
    parkingType?: ParkingType,
    minTime?: number,
    maxTime?: number,
    travelMode?: TravelMode,
    transitMode?: TransitMode,
  }) {
    this.boundingBox = boundingBox;
    this.roomType = roomType;
    this.propertyTypes = propertyTypes;
    this.minBudget = minBudget;
    this.maxBudget = maxBudget;
    this.furnishingType = furnishingType;
    this.bathroomType = bathroomType;
    this.parkingType = parkingType;
    this.minTime = minTime;
    this.maxTime = maxTime;
    this.travelMode = travelMode;
    this.transitMode = transitMode;
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
    req.minBudget || null,
    req.maxBudget || null,
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
