export class TravelTimeRequest {
  readonly travelMode: string;
  readonly transitMode?: string;
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
      travelMode: string,
      transitMode?: string,
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

export class TravelTimeResponse {
  readonly duration: string;
  readonly travelMode: string;

  constructor({
      duration,
      travelMode,
  }: {
      duration: string,
      travelMode: string,
  }) {
    this.duration = duration;
    this.travelMode = travelMode;
  }
}
