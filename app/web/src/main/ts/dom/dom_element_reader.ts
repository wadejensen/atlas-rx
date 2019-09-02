import {LatLngLiteral} from "@google/maps";
import {
  BathroomType,
  FurnishingType,
  ListingsRequest, ParkingType,
  RoomType
} from "../../../../../common/src/main/ts/flatmates/listings_request";
import {getSearchBar} from "./dom_element_locator";
import {None, Option, Some} from "../../../../../common/src/main/ts/fp/option";
import {GoogleMap} from "../maps";

export function getFlatmatesCriteria(): ListingsRequest {
  return new ListingsRequest({
    boundingBox: GoogleMap.getBounds().get(),
    minBudget: parseInt(getInputFieldValue("min-rent")) || undefined,
    maxBudget: parseInt(getInputFieldValue("max-rent")) || undefined,
    roomType: getInputFieldValue("room-type") as RoomType || undefined,
    furnishingType: getInputFieldValue("furnishing-type") as FurnishingType || undefined,
    bathroomType: getInputFieldValue("bathroom-type") as BathroomType || undefined,
    parkingType: getInputFieldValue("parking-type") as ParkingType || undefined,
  });
}

export function getDestination(): Option<LatLngLiteral> {
  const searchBar = getSearchBar()!;

  const lat = parseFloat(searchBar.dataset["lat"]!);
  const lng = parseFloat(searchBar.dataset["lng"]!);

  if (lat === undefined || Number.isNaN(lat) || lng === undefined || Number.isNaN(lng)) {
    return new None<LatLngLiteral>();
  } else {
    return new Some({
      lat: lat,
      lng: lng,
    });
  }
}

function getInputFieldValue(id: string) {
  return (document.getElementById(id) as HTMLInputElement).value
}
