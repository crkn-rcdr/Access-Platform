import Queue from "queue-promise";
const DEFAULT_QUEUE_DELAY = 10000;

export class RouteLimiter {
  limiters: Map<string, Queue>;
  name: number;

  constructor() {
    this.limiters = new Map<string, Queue>();
    this.name = Math.random() * 1000;
  }

  setLimiter(route: string) {
    const queue = new Queue({
      concurrent: 1,
      interval: DEFAULT_QUEUE_DELAY,
    });
    this.limiters.set(route, queue);
  }

  getLimiter(route: string) {
    return this.limiters.get(route);
  }

  async queueJob(route: string, callback: Function) {
    if (typeof this.getLimiter(route) === "undefined") this.setLimiter(route);
    const routeLimiter = this.getLimiter(route);
    if (typeof routeLimiter !== "undefined") {
      routeLimiter.enqueue(async () => {
        try {
          await callback();
        } catch (e: any) {
          console.log(
            "Error executing callback in route limiter: ",
            e?.message
          );
          console.log("Route: ", route);
        }
      });
      return true;
    } else return false;
  }
}
