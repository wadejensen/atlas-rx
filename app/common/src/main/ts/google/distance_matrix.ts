import {TransitMode, TravelMode} from "@google/maps";

export class TravelTimeRequest {
  readonly travelMode: TravelMode;
  readonly transitMode?: TransitMode;
  readonly lat1: number;
  readonly lng1: number;
  readonly lat2: number;
  readonly lng2: number;

  constructor({
      travelMode,
      transitMode,
      lat1,
      lng1,
      lat2,
      lng2,
  }: {
      travelMode: TravelMode,
      transitMode?: TransitMode,
      lat1: number,
      lng1: number,
      lat2: number,
      lng2: number,
  }) {
    this.travelMode = travelMode;
    this.transitMode = transitMode;
    this.lat1 = lat1;
    this.lng1 = lng1;
    this.lat2 = lat2;
    this.lng2 = lng2;
  }
}

export class TravelTime {
  readonly duration: number;
  readonly durationDisplay: string;
  readonly travelMode: TravelMode;
  readonly transitMode?: TransitMode;

  constructor({
      duration,
      durationDisplay,
      travelMode,
      transitMode,
  }: {
    duration: number,
    durationDisplay: string,
    travelMode: TravelMode,
    transitMode?: TransitMode,
  }) {
    this.duration = duration;
    this.durationDisplay = durationDisplay;
    this.travelMode = travelMode;
    this.transitMode = transitMode;
  }
}
