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
      console.log("Num requests = " + this.reqCount.toString());
      this.reqCount = Math.max(0, this.reqCount - this.reqPerSec)
    };

  apply: (fn: () => Promise<void>) => Promise<void> =
    async (fn: () => void) => {
      if (this.isOpen()) {
        console.log("Request count = " + this.reqCount.toString());
        this.reqCount += 1;
        console.log("Open");
        console.log("Request count = " + this.reqCount.toString());
        return await fn();
      } else {
        console.log("Throttled");
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
