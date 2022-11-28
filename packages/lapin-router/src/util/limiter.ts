import Queue from "queue-promise";
import { Lock } from "semaphore-async-await";

const DEFAULT_QUEUE_DELAY = 10000;

/**
 * Each route in the api can make their own Queue that they can use to limit the number of concurrent requests made (jobs), and can stagger them by a delay.
 */
export class RouteLimiter {
  /**
   * This holds a mapping of the api route string -> semaphore (lock) for that route
   */
  semaphoreLimiters: Map<string, Lock>;

  /**
   * This holds a mapping of the api route string -> queue for that route
   */
  queueLimiters: Map<string, Queue>;

  constructor() {
    this.queueLimiters = new Map<string, Queue>();
    this.semaphoreLimiters = new Map<string, Lock>();
  }

  /**
   * Allows the developer to create a lock for a route
   */
  setLimiterSemaphore(route: string) {
    const lock = new Lock();
    this.semaphoreLimiters.set(route, lock);
  }

  /**
   * Allows the developer to get the lock for a route
   */
  getLimiterSemaphore(route: string): Lock | undefined {
    const lock = this.semaphoreLimiters.get(route);
    if (!lock) this.setLimiterSemaphore(route);
    return this.semaphoreLimiters.get(route);
  }

  /**
   * Creates a Queue for a route. Allows for concurrent # of jobs, ran at interval.
   */
  setLimiterQueue(route: string, concurrent: number, interval: number) {
    const queue = new Queue({
      concurrent,
      interval,
    });
    this.queueLimiters.set(route, queue);
  }

  /**
   * Gets a Queue for a route
   */
  getLimiterQueue(route: string): Queue | undefined {
    return this.queueLimiters.get(route);
  }

  /**
   * Important: Does not hold the application for the delay, DEFAULT_QUEUE_DELAY, between jobs, but also makes it hard to know the status of the job execution, unless there is a timestamp in the database I can use to check if the dmd processed correctly after the job was added.
   *
   * I could use the 'updated' key but that would also change any time anything is updated in the editor. I'm not sure if there's any timestamp only set when the DMD updating tool is ran on an object.
   *
   * This adds a job to the queue and does not wait for the job to be executed, instead it returns of the job has been added to the queue successfully or not.
   * @param route the route of the queue to add the job to
   * @param callback the code for the job to be executed in turn
   * @returns boolean true or false, depending on if the job was added to the Queue or not
   */
  queueBackgroundJob(
    route: string,
    callback: Function,
    concurrent = 1,
    interval = DEFAULT_QUEUE_DELAY
  ) {
    if (typeof this.getLimiterQueue(route) === "undefined")
      this.setLimiterQueue(route, concurrent, interval);
    const routeLimiter = this.getLimiterQueue(route);
    if (typeof routeLimiter !== "undefined") {
      routeLimiter.enqueue(async () => {
        try {
          await callback();
          //console.log("Successfully executed job on route: ", route);
        } catch (e: any) {
          console.log(
            "Error executing callback in route limiter: ",
            e?.message
          );
        }
      });
      return true;
    } else return false;
  }

  /**
   * Important: Causes the application to hold for the delay, DEFAULT_QUEUE_DELAY, but I can tell the user that the changes should be made as long as the dmd updating scripts run successfully.
   * (I think the queueBackgroundJob + a periodic check for a timestamp of when dmd updating completely finishes across all the different scripts that run is better. Rather than holding up the app by checking if the metadata file was updated, because then I still don't have any programmatic indicator of if the updates propagate correctly. I would get best of both with the queueBackgroundJob + a timestamp of when the scripts finished on an object. )
   *
   * This adds a job to the queue and allows for code to wait for the job to be executed
   * @param route the route of the queue to add the job to
   * @param callback the code for the job to be executed in turn
   * @returns A boolean Promise indicating if the job has successfully executed or not
   */
  queueJob(
    route: string,
    callback: Function,
    concurrent = 1,
    interval = DEFAULT_QUEUE_DELAY
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (typeof this.getLimiterQueue(route) === "undefined")
        this.setLimiterQueue(route, concurrent, interval);
      const routeLimiter = this.getLimiterQueue(route);
      if (typeof routeLimiter !== "undefined") {
        routeLimiter.enqueue(async () => {
          try {
            const res = await callback();
            resolve(typeof res !== "undefined" ? res : true);
          } catch (e: any) {
            const error = `Error executing callback in route limiter: ${e?.message}`;
            console.log(error);
            reject(error);
          }
        });
      }
    });
  }
}
