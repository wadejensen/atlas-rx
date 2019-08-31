/**
 * A hacky and unfortunate replacement for something that should be in the
 * Typescript standard library.
 */
export function setMerge<T>(left: Set<T>, right: Set<T>): Set<T> {
  let retval = new Set()
  left.forEach( elem => retval.add(elem));
  right.forEach( elem => retval.add(elem));
  return retval;
}
