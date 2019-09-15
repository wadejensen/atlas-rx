import Timeout = NodeJS.Timeout;

export class Debouncer {
  // time in milliseconds since last input
  private lastBounceTime: number = 0;
  // function to execute when input has ceased for `intervalMs`
  private lastInputLambda: () => void =
    () => undefined;
  // reference to a cancellable, delayed, future to call `lastInputLambda` after
  // `intervalMs` from last input
  private lastTimeoutId: Timeout = setTimeout(() => undefined, this.intervalMs);

  /**
   * @param intervalMs number of milliseconds of inactivity required before the
   * debouncer's apply method is called.
   */
  constructor(readonly intervalMs: number) {}

  /**
   * Ensure user input has ceased before triggering a function call.
   * Schedules the provided function for execution in `intervalMs`, cancelling
   * any currently scheduled calls since the last debounced execution.
   */
  apply: (fn: () => Promise<void>) => Promise<void> =
    async (fn: () => void) => {
      this.lastBounceTime = new Date().getTime();
      this.lastInputLambda = fn;
      clearTimeout(this.lastTimeoutId);
      this.lastTimeoutId = setTimeout(this.doApply, this.intervalMs);
  };

  private doApply: () => Promise<void> =
    async () => {
      // ensure `intervalMs` has elapsed since last user input
      const now = new Date().getTime();
      if (now - this.lastBounceTime >= this.intervalMs) {
        return this.lastInputLambda();
      }
    }
}
