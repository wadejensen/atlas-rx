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

  /**
   * Divide a bounding box into four quadrants
   * 
   * ----------------------------------
   * |                |               |
   * |                |               |
   * |                |               |
   * |       Q2       |       Q1      |
   * |                |               |
   * |                |               |
   * |                |               |
   * -----------------C----------------
   * |                |               |
   * |                |               |
   * |                |               |
   * |                |               |
   * |       Q3       |       Q4      |
   * |                |               |
   * |                |               |
   * |                |               |
   * ----------------------------------
   */
  static quadrants(
    boundingBox: BoundingBox
  ): [BoundingBox, BoundingBox, BoundingBox, BoundingBox] {
    return [
      Geo.quadrant1(boundingBox),
      Geo.quadrant2(boundingBox),
      Geo.quadrant3(boundingBox),
      Geo.quadrant4(boundingBox)
    ];
  }

  /**
   * Top right quadrant of a bounding box (Q1)
   */
  private static quadrant1(boundingBox: BoundingBox): BoundingBox {
    const centroid = new Coord(
      (boundingBox.topLeft.lat + boundingBox.bottomRight.lat) / 2,
      (boundingBox.topLeft.lon + boundingBox.bottomRight.lon) / 2,
    );

    const topRight = new Coord(
      boundingBox.topLeft.lat,
      boundingBox.bottomRight.lon,
    );

    return Geo.boundingBox(centroid, topRight);
  }

  /**
   * Top left quadrant of a bounding box (Q2)
   */
  private static quadrant2(boundingBox: BoundingBox): BoundingBox {
    const centroid = new Coord(
      (boundingBox.topLeft.lat + boundingBox.bottomRight.lat) / 2,
      (boundingBox.topLeft.lon + boundingBox.bottomRight.lon) / 2,
    );

    return Geo.boundingBox(boundingBox.topLeft, centroid);
  }

  /**
   * Bottom left quadrant of a bounding box (Q3)
   */
  private static quadrant3(boundingBox: BoundingBox): BoundingBox {
    const centroid = new Coord(
      (boundingBox.topLeft.lat + boundingBox.bottomRight.lat) / 2,
      (boundingBox.topLeft.lon + boundingBox.bottomRight.lon) / 2,
    );

    const bottomLeft = new Coord(
      boundingBox.bottomRight.lat,
      boundingBox.topLeft.lon
    );

    return Geo.boundingBox(bottomLeft, centroid);
  }

  /**
   * Bottom right quadrant of a bounding box (Q4)
   */
  private static quadrant4(boundingBox: BoundingBox): BoundingBox {
    const centroid = new Coord(
      (boundingBox.topLeft.lat + boundingBox.bottomRight.lat) / 2,
      (boundingBox.topLeft.lon + boundingBox.bottomRight.lon) / 2,
    );
    return Geo.boundingBox(centroid, boundingBox.bottomRight);
  }
}
