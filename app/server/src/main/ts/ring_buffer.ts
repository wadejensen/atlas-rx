import {Preconditions} from "../../../../common/src/main/ts/preconditions";

export class RingBuffer<T> {
  private xs: T[] = new Array<T>();

  constructor(readonly capacity: number) {
    Preconditions.checkArgument(Number.isInteger(capacity));
  }

  append(x: T) {
    if (this.xs.length == this.capacity) {
      this.xs.shift();
    }
    this.xs.push(x);
  }

  head(): T {
    return this.xs[0];
  }

  // get(i :number): T {
  //   return this.xs[i];
  // }

  // size(): number {
  //   return this.xs.length;
  // }
}
