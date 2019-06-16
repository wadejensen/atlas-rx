import {Coord, Geo} from "../../main/ts/geo";

describe("Geo", () => {
  test("boundingBox with coordinates in first quadrant", () => {
    let boundingBox = Geo.boundingBox(
      new Coord(10.0, 10.0),
      new Coord(20.0, 20.0)
    );
    expect(boundingBox.topLeft.lat).toBe(20.0);
    expect(boundingBox.topLeft.lon).toBe(10.0);
    expect(boundingBox.bottomRight.lat).toBe(10.0);
    expect(boundingBox.bottomRight.lon).toBe(20.0);
  });

  test("boundingBox with coordinates in second quadrant", () => {
    let boundingBox = Geo.boundingBox(
      new Coord(10.0, -10.0),
      new Coord(20.0, -20.0)
    );

    expect(boundingBox.topLeft.lat).toBe(20.0);
    expect(boundingBox.topLeft.lon).toBe(-20.0);
    expect(boundingBox.bottomRight.lat).toBe(10.0);
    expect(boundingBox.bottomRight.lon).toBe(-10.0);
  });

  test("boundingBox with coordinates in third quadrant", () => {
    let boundingBox = Geo.boundingBox(
      new Coord(-10.0, -10.0),
      new Coord(-20.0, -20.0)
    );

    expect(boundingBox.topLeft.lat).toBe(-10.0);
    expect(boundingBox.topLeft.lon).toBe(-20.0);
    expect(boundingBox.bottomRight.lat).toBe(-20.0);
    expect(boundingBox.bottomRight.lon).toBe(-10.0);
  });

  test("boundingBox with coordinates in forth quadrant", () => {
    let boundingBox = Geo.boundingBox(
      new Coord(-10.0, 10.0),
      new Coord(-20.0, 20.0)
    );

    expect(boundingBox.topLeft.lat).toBe(-10.0);
    expect(boundingBox.topLeft.lon).toBe(10.0);
    expect(boundingBox.bottomRight.lat).toBe(-20.0);
    expect(boundingBox.bottomRight.lon).toBe(20.0);
  });

  test("boundingBox with coordinates across prime meridian and equator", () => {
    let boundingBox = Geo.boundingBox(
      new Coord(10.0, 10.0),
      new Coord(-10.0, -10.0)
    );

    expect(boundingBox.topLeft.lat).toBe(10.0);
    expect(boundingBox.topLeft.lon).toBe(-10.0);
    expect(boundingBox.bottomRight.lat).toBe(-10.0);
    expect(boundingBox.bottomRight.lon).toBe(10.0);
  });

  test("boundingBox with coordinates across anti-meridian and equator", () => {
    let boundingBox = Geo.boundingBox(
      new Coord(-10.0, 170.0),
      new Coord(10.0, -170.0)
    );

    expect(boundingBox.topLeft.lat).toBe(10.0);
    expect(boundingBox.topLeft.lon).toBe(170.0);
    expect(boundingBox.bottomRight.lat).toBe(-10.0);
    expect(boundingBox.bottomRight.lon).toBe(-170.0);
  });
});
