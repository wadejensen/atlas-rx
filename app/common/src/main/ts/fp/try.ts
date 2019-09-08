/**
 * Reimplementation of a subset of the functionality of Scala's Try typeclass.
 * The reimplementation is not a true translation to Typescript; the map and
 * flatMap functions are modified to make `Try` a valid functor.
 *
 * Original Scala source
 * https://github.com/scala/scala/blob/1486a671c11e5770144404e3df4ee1b31fab2066/src/library/scala/util/Try.scala
 *
 * Typescript implementation adapted from
 * https://github.com/yaakaito/monapt/blob/master/src/try.ts.
 *
 * The `Try` type represents a computation that may either result in an
 * exception, or return a successfully computed value. It's similar to,
 * but semantically different from a logical disjunction type.
 *
 * Instances of `Try<T>`, are either an instance of Success<T> or Failure<T>.
 */
export function TryCatch<T>(f: () => T): Try<T> {
  try {
    return new Success<T>(f());
  }
  catch(e) {
    return new Failure<T>(e);
  }
}

export abstract class Try<T> {
  /**
   * Returns `true` if the `Try` is a `Success`, `false` otherwise.
   */
  abstract isSuccess(): boolean

  /**
   * Returns `true` if the `Try` is a `Failure`, `false` otherwise.
   */
  abstract isFailure(): boolean

  /**
   * Returns the value from this `Success` or throws the exception if this
   * is a `Failure`.
   */
  abstract get(): T;

  /**
   * Returns the Error value from this `Failure` or throws a TypeError if this
   * is a `Success`.
   */
  abstract err(): Error

  /**
   * Returns the value from this `Success` or the given `default` argument if
   * this is a `Failure`.
   *
   * ''Note:'': This will throw an exception if it is not a success and default
   * throws an exception.
   */
  abstract getOrElse(defaultValue: () => T): T

  /**
   * Returns this `Try` if it's a `Success` or the given `default` argument if
   * this is a `Failure`.
   */
  abstract orElse<U extends T>(alternative: () => Try<U>): Try<T>

  /**
   * Returns the given function applied to the value from this `Success` or
   * returns this if this is a `Failure`.
   */
  abstract map<U>(f: (value: T) => U): Try<U>;

  /**
   * Maps the given function to the value from this `Success` or returns this if
   * this is a `Failure`.
   */
  abstract flatMap<U>(f: (value: T) => Try<U>): Try<U>;

  abstract filter(predicate: (value: T) => boolean): Try<T>;

  /**
   * Applies the given function `f` if this is a `Success`, otherwise returns
   * `Unit` if this is a `Failure`.
   *
   * ''Note:'' If `f` throws, then this method may throw an exception.
   */
  abstract foreach(f: (value: T) => void): void;

  /**
   * Applies the given function `f` if this is a `Failure`, otherwise returns this if this is a `Success`.
   * This is like map for the exception.
   */
  abstract recover(f: (error: Error) => T): Try<T>;

  /**
   * Applies the given function `f` if this is a `Failure`, otherwise returns
   * this if this is a `Success`.
   * This is like `flatMap` for the exception.
   */
  abstract recoverWith(f: (error: Error) => Try<T>): Try<T>;

  /**
   * Convert Try<T> to Promise<T>
   */
  abstract promise(): Promise<T>
}

export class Success<T> extends Try<T> {
  constructor(private readonly value: T) {
    super();
  }

  isSuccess(): boolean {
    return true;
  }

  isFailure(): boolean {
    return false;
  }

  get(): T {
    return this.value;
  }

  err(): Error {
    throw TypeError("Success type does not contain an error value.")
  }

  getOrElse(defaultValue: () => T): T {
    return this.get();
  }

  orElse(alternative: () => Try<T>): Try<T> {
    return this;
  }

  map<U>(f: (value: T) => U): Try<U> {
    return new Success(f(this.value));
  }

  flatMap<U>(f: (value: T) => Try<U>): Try<U> {
    return f(this.value);
  }

  /**
   * Converts this to a `Failure` if the predicate is not satisfied.
   */
  filter(predicate: (value: T) => boolean): Try<T> {
    if (predicate(this.value)) {
      return this;
    }
    else {
      return new Failure<T>(new Error('Predicate does not hold for ' + this.value));
    }
  }

  foreach<U>(f: (value: T) => U) {
    f(this.value);
  }

  recover(f: (error: Error) => T): Try<T> {
    return this;
  }

  recoverWith(fn: (error: Error) => Try<T>): Try<T> {
    return this;
  }

  promise(): Promise<T> {
    return Promise.resolve(this.value);
  }
}

export class Failure<T> extends Try<T> {
  constructor(private readonly error: Error) {
    super();
  }

  isSuccess(): boolean {
    return false;
  }

  isFailure(): boolean {
    return true;
  }

  get(): T {
    throw this.error;
  }

  err(): Error {
    return this.error;
  }

  getOrElse(defaultValue: () => T): T {
    return defaultValue();
  }

  orElse(alternative: () => Try<T>): Try<T> {
    return alternative();
  }

  map<U>(f: (value: T) => U): Try<U> {
    return new Failure<U>(this.error);
  }

  flatMap<U>(f: (value: T) => Try<U>): Try<U> {
    return new Failure<U>(this.error);
  }

  filter(predicate: (value: T) => boolean): Try<T> {
    return this;
  }

  foreach(f: (value: T) => void) {
    return;
  }

  recover(f: (error: Error) => T): Try<T> {
    return new Success(f(this.error));
  }

  recoverWith(f: (error: Error) => Try<T>): Try<T> {
    try {
      return f(this.error);
    }
    catch (e) {
      return new Failure<T>(this.error);
    }
  }

  promise(): Promise<T> {
    return Promise.reject(this.error);
  }
}
