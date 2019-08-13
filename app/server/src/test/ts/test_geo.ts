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

  test("quadrant1 of BoundingBox", () => {
    const boundingBox = Geo.boundingBox(new Coord(10, 10), new Coord(-10, -10));
    const [q1, q2, q3, q4] = Geo.quadrants(boundingBox);

    expect(q1.topLeft).toStrictEqual(new Coord(10, 0));
    expect(q1.bottomRight).toStrictEqual(new Coord(0, 10));
    expect(q2.topLeft).toStrictEqual(new Coord(10, -10));
    expect(q2.bottomRight).toStrictEqual(new Coord(0, 0));
    expect(q3.topLeft).toStrictEqual(new Coord(0, -10));
    expect(q3.bottomRight).toStrictEqual(new Coord(-10, 0));
    expect(q4.topLeft).toStrictEqual(new Coord(0, 0));
    expect(q4.bottomRight).toStrictEqual(new Coord(-10, 10));
  });
});
