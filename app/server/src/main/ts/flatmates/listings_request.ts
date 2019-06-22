export class ListingsRequest {
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
