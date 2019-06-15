import {FlatmatesListingsRequest, PropertyType, RoomType, Search} from "./map_markers_request";
import {BoundingBox} from "../geo";

export class MapMarkersRequestFactory {
  static create({
    room,
    propertyTypes,
    minBudget,
    maxBudget,
    boundingBox,
}: {
    room?: RoomType,
    propertyTypes?: Array<PropertyType>,
    minBudget?: number,
    maxBudget?: number,
    boundingBox: BoundingBox
  }) {
    return new FlatmatesListingsRequest(
      new Search(
        "rooms",
        room || null,
        propertyTypes || null,
        minBudget || 0,
        maxBudget || 10_000,
        `${boundingBox.topLeft.lat}, ${boundingBox.topLeft.lon}`,
        `${boundingBox.bottomRight.lat}, ${boundingBox.bottomRight.lon}`,
      )
    )
  }
}
