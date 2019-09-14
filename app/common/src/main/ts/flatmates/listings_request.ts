import {BoundingBox} from "../geo";

export class FlatmatesListingsRequest {
  constructor(readonly search: Search) {}
}

export class Search {
  constructor(
      readonly mode: string | null,
      readonly room: string | null,
      readonly property_types: Array<string> | null,
      readonly min_budget: number | null,
      readonly max_budget: number | null,
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
