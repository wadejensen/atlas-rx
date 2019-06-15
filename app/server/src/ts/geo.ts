export class Coord {
  constructor(readonly lat: number, readonly lon: number) {}
}

export class BoundingBox {
  /**
   * Use {@link Geo.boundingBox} rather than calling this constructor directly
   */
  constructor(readonly topLeft: Coord, readonly bottomRight: Coord) {}
}

export class Geo {
  /**
   * Creates the smallest bounding box for a pair of geos in terms of TopLeft
   * and BottomRight coordinates, gracefully handling bounding boxes across
   * the international dateline regardless of the order oof supplied arguments.
   */
  static boundingBox(a: Coord, b: Coord) {
    /**
     * The correct way to draw a bounding box across the international dateline
     * is ambiguous. This is because a vector drawn from the lower longitude to
     * the higher latitude will actually wrap around the globe the
     * "long way around".
     *
     * We check for this case by comparing the longitudes of each point to
     * determine which direction around the globe is shorter.
     */
    let lonMin = Math.min(a.lon, b.lon);
    let lonMax = Math.max(a.lon, b.lon);
    let [topLeftLon, bottomRightLon] = (lonMax - lonMin) < (360 + lonMin - lonMax)
      ? [lonMin, lonMax]
      : [lonMax, lonMin];

    /**
     * Latitude handling across the North and South poles is simpler, as lines
     * of latitude are not great circles. The bottom latitude is simply the one
     * with the lowest value.
     */
    let topleftLat = Math.max(a.lat, b.lat);
    let bottomRightLat = Math.min(a.lat, b.lat);

    return new BoundingBox(
      new Coord(topleftLat, topLeftLon),
      new Coord(bottomRightLat, bottomRightLon)
    )
  }
}
