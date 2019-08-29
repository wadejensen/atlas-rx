import {Async} from "./async";
import {sys} from "typescript";

export class LosslessThrottle {
  private reqCount = 0;
  private queueDepth = 0;

  /**
   * @param reqPerSec number of requests allowed per second
   */
  constructor(readonly reqPerSec: number) {
    setInterval(this.resetReqCount, 1000);
  }

  private resetReqCount = async () => {
    if (this.reqCount != 0 && this.queueDepth != 0) {
      // We should never exceed reqPerSec, but if we do, bring the server down
      if (this.reqCount > this.reqPerSec) sys.exit(1);
    }
    this.reqCount = Math.max(0, this.reqCount - this.reqPerSec)
  };

  apply: <T>(fn: () => Promise<T>) => Promise<T> =
    async <T>(fn: () => Promise<T>) => {
      this.queueDepth += 1;
      const retval = await this.doThrottle(fn);
      this.queueDepth -= 1;
      return retval;
    };

  private doThrottle: <T>(fn: () => Promise<T>) => Promise<T> =
    async <T>(fn: () => Promise<T>) => {
      if (this.isOpen()) {
        this.reqCount += 1;
        return fn();
      } else {
        const retval = await Async.delay(() => this.doThrottle(fn), 1000 / this.reqPerSec);

        return retval;
      }
    };

  /**
   * Should an invocation be allowed? Is the throttle open or closed?
   */
  private isOpen(): boolean {
    return this.reqCount < this.reqPerSec;
  }
}
