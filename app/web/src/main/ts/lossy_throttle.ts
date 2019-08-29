export class LossyThrottle {
  private reqCount = 0;

  /**
   * @param reqPerSec number of requests allowed per second
   */
  constructor(readonly reqPerSec: number) {
    setInterval(this.resetReqCount, 1000);
  }

  resetReqCount: () => void =
    () => {
      this.reqCount = Math.max(0, this.reqCount - this.reqPerSec)
    };

  apply: (fn: () => Promise<void>) => Promise<void> =
    async (fn: () => void) => {
      if (this.isOpen()) {
        this.reqCount += 1;
        return await fn();
      } else {
        // drop the request
        return undefined;
      }
    };

  /**
   * Should an invocation be allowed? Is the throttle open or closed?
   */
  private isOpen(): boolean {
    return this.reqCount < this.reqPerSec;
  }
}
