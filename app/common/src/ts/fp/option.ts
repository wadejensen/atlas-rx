export function Maybe<A>(value: A): Option<A> {
  if (value !== undefined && value !== null) {
    return new Some(value);
  }
  else {
    return new None<A>();
  }
}

export abstract class Option<A> {
  abstract isEmpty(): boolean;

  abstract get(): A;
  abstract getOrElse(defaultValue: () => A): A;
  abstract orElse(alternative: () => Option<A>): Option<A>;

  abstract map<B>(f: (value: A) => B): Option<B>;
  abstract flatMap<B>(f: (value: A) => Option<B>): Option<B>;

  abstract filter(predicate: (value: A) => boolean): Option<A>;

  abstract foreach(f: (value: A) => void): void;
}

export class Some<A> implements Option<A> {
  constructor(private value: A) { }

  isEmpty(): boolean {
    return false;
  };

  get(): A {
    return this.value;
  }

  getOrElse(defaultValue: () => A): A {
    return this.value;
  }

  orElse(alternative: () => Option<A>): Option<A> {
    return this;
  }

  map<B>(f: (value: A) => B): Option<B> {
    return new Some<B>(f(this.value));
  }

  flatMap<B>(f: (value: A) => Option<B>): Option<B> {
    return f(this.value);
  }

  filter(predicate: (value: A) => boolean): Option<A> {
    if (predicate(this.value)) {
      return this;
    }
    else {
      return new None<A>();
    }
  }

  foreach<B>(f: (value: A) => B) {
    f(this.value);
  }
}

export class None<A> implements Option<A> {
  isEmpty(): boolean {
    return true;
  }

  get(): A {
    throw new Error('No such element.');
  }

  getOrElse(defaultValue: () => A): A {
    return defaultValue();
  }

  orElse(alternative: () => Option<A>): Option<A> {
    return alternative();
  }

  map<B>(f: (value: A) => B): Option<B> {
    return new None<B>();
  }

  flatMap<B>(f: (value: A) => Option<B>): Option<B> {
    return new None<B>();
  }

  filter(predicate: (value: A) => boolean): Option<A> {
    return this;
  }

  foreach(f: (value: A) => void) {
    return;
  }
}
