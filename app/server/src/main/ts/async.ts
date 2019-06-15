export class Async {
  /**
   * Performs a computation after specified delay.
   */
  static delay<T>(fn: () => Promise<T>, delayMs: number): Promise<T> {
    return new Promise((resolve, reject) =>
      setTimeout(() => resolve(fn()), delayMs)
    )
  }
  /**
   * Performs a computation with a specified max runtime, after which a
   * fallback result will be used.
   */
  static timeout<T>(
      fn: () => Promise<T>,
      fallback: () => T,
      timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      Async.delay(() => Promise.resolve(fallback()), timeoutMs)
    ]);
  }

  /**
   * Performs a computation with a specified max runtime, after which an error
   * will be thrown.
   */
  static timeoutError<U, T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    message: string
  ): Promise<T> {
    return Promise.race([
      fn(),
      Async.delay(() => Promise.reject(message), timeoutMs)
    ]);
  }

  /**
   * Wraps a function which returns a Promise inside another function which has
   * a specified max runtime, after which an error will be thrown.
   */
  static curryTimeoutError<U, T>(
      fn: (arg: U) => Promise<T>,
      timeoutMs: number,
      message: string
  ): (arg: U) => Promise<T> {
    return (u: U) => Promise.race([
      fn(u),
      Async.delay(() => Promise.reject(message), timeoutMs)]
    );
  }

  /**
   * Performs a computation, retrying on failure, using a linear backoff retry
   * policy.
   */
  static backoff<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    intervalMs: number
  ): Promise<T> {
    return Async.doBackoff(fn, maxRetries, intervalMs, 0)
  }

  private static doBackoff<T>(
      fn: () => Promise<T>,
      maxRetries: number,
      delayMs: number,
      retryCount: number
  ): Promise<T> {
    return fn().catch((reason) => {
      if (retryCount == maxRetries) {
        return Promise.reject(
          `Retried request ${maxRetries} times. Last error: ${reason}`
        )
      }
      else {
        return Async.delay(
          () => this.doBackoff(
            fn,
            maxRetries,
            delayMs,
            retryCount + 1
          ),
          delayMs
        )
      }
    });
  }

  /**
   * Performs a computation, retrying on failure, using an exponential backoff
   * retry policy.
   */
  static exponentialBackoff<T>(
      fn: () => Promise<T>,
      maxRetries: number,
      intervalMs: number
  ): Promise<T> {
    return Async.doExponentialBackoff(fn, maxRetries, intervalMs, 0)
  }

  private static doExponentialBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number,
    delayMs: number,
    retryCount: number
  ): Promise<T> {
    return fn().catch((reason) => {
      if (retryCount == maxRetries) {
        return Promise.reject(
          `Retried request ${maxRetries} times. Last error: ${reason}`
        )
      }
      else {
        return Async.delay(
          () => this.doExponentialBackoff(
            fn,
            maxRetries,
            delayMs * 2,
            retryCount + 1,
          ),
          delayMs
        )
      }
    });
  }
}
