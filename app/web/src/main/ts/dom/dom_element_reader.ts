import {LatLngLiteral, TransitMode, TravelMode} from "@google/maps";
import {
  BathroomType,
  FurnishingType,
  ParkingType,
  RoomType
} from "../../../../../common/src/main/ts/flatmates/listings_request";
import {getSearchBar} from "./dom_element_locator";
import {None, Option, Some} from "../../../../../common/src/main/ts/fp/option";
import {GoogleMap} from "../maps";
import {ListingsRequest} from "../../../../../common/src/main/ts/listing";

export function getFreeCriteria(): ListingsRequest {
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

export function getExpensiveCriteria(): ListingsRequest {
  return new ListingsRequest({
    boundingBox: GoogleMap.getBounds().get(),
    minBudget: parseInt(getInputFieldValue("min-rent")) || undefined,
    maxBudget: parseInt(getInputFieldValue("max-rent")) || undefined,
    roomType: getInputFieldValue("room-type") as RoomType || undefined,
    furnishingType: getInputFieldValue("furnishing-type") as FurnishingType || undefined,
    bathroomType: getInputFieldValue("bathroom-type") as BathroomType || undefined,
    parkingType: getInputFieldValue("parking-type") as ParkingType || undefined,
    destination: !getDestination().isEmpty() ? getDestination().get() : undefined,
    minTime: parseInt(getInputFieldValue("min-time")) || undefined,
    maxTime: parseInt(getInputFieldValue("max-time")) || undefined,
    travelMode: getInputFieldValue("travel-mode") as TravelMode || undefined,
    transitMode: getInputFieldValue("transit-mode") as TransitMode || undefined,
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
