const State = {
  IDLE: 0,
  RUNNING: 1,
  STOPPED: 2,
};

type Options = {
  concurrent: number;
  interval: number;
  start: boolean;
};

const workerCode = `
  this.addEventListener("message", function (evt) {
    let data = evt.data;
    let time = parseInt(data.timeout || 0, 10);
    setTimeout(() => {
      this.postMessage({ time: Date.now() });
    }, time);
  });        
`;

/**
 * A small and simple library for promise-based deques. It will execute pushd
 * functions concurrently at a specified speed. When a task is being resolved or
 * rejected, an event is emitted.
 *
 * @example
 *    const deque = new Deque({
 *      concurrent: 1,
 *      interval: 2000
 *    });
 *
 *    deque.on("resolve", data => console.log(data));
 *    deque.on("reject", error => console.error(error));
 *
 *    deque.push(asyncTaskA);
 *    deque.push([asyncTaskB, asyncTaskC]);
 *
 * @class   Deque
 */
export default class Deque {
  /**
   * A collection to store unresolved tasks. We use a Map here because V8 uses a
   * variant of hash tables that generally have O(1) complexity for retrieval
   * and lookup.
   *
   * @see     https://codereview.chromium.org/220293002/
   * @type    {Map}
   * @access  private
   */
  tasks: Array<Function> = []; //Map<number, Function> = new Map();

  /**
   * @type    {number}  Used to generate a unique id for each task
   * @access  private
   */
  uniqueId: number = 0;

  /**
   * @type    {number}
   * @access  private
   */
  lastRan: number = 0;

  /**
   * @type    {number}  Amount of tasks currently handled by the deque
   * @access  private
   */
  currentlyHandled: number = 0;

  /**
   * @type    {State}
   * @access  public
   */
  state: number = State.IDLE;

  /**
   * @type    {Object}  options
   * @type    {number}  options.concurrent  How many tasks should be executed in parallel
   * @type    {number}  options.interval    How often should new tasks be executed (in ms)
   * @type    {boolean} options.start       Whether it should automatically execute new tasks as soon as they are added
   * @access  public
   */
  options: Options = {
    concurrent: 5,
    interval: 500,
    start: true,
  };

  /**
   * Initializes a new deque instance with provided options.
   *
   * @param   {Object}  options
   * @param   {number}  options.concurrent  How many tasks should be executed in parallel
   * @param   {number}  options.interval    How often should new tasks be executed (in ms)
   * @param   {boolean} options.start       Whether it should automatically execute new tasks as soon as they are added
   * @return  {Deque}
   */
  constructor(
    options: Options = {
      concurrent: 1,
      interval: 0,
      start: true,
    }
  ) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Starts the deque if it has not been started yet.
   *
   * @emits   start
   * @return  {void}
   * @access  public
   */
  startBack(): void {
    if (this.state !== State.RUNNING && !this.isEmpty) {
      this.state = State.RUNNING;
      //this.emit("start");

      (async () => {
        while (this.shouldRun) {
          await this.popBack();
        }
      })();
    }
  }

  /**
   * Starts the deque if it has not been started yet.
   *
   * @emits   start
   * @return  {void}
   * @access  public
   */
  startFront(): void {
    if (this.state !== State.RUNNING && !this.isEmpty) {
      this.state = State.RUNNING;

      (async () => {
        while (this.shouldRun) {
          await this.popFront();
        }
      })();
    }
  }

  stop(): void {
    this.state = State.STOPPED;
  }

  finalize(): void {
    this.currentlyHandled -= 1;

    if (this.currentlyHandled === 0 && this.isEmpty) {
      this.stop();

      // Finalize doesn't force deque to stop as `Deque.stop()` does. Therefore,
      // new tasks should be still resolved automatically if `options.start` was
      // set to `true` (see `Deque.push`):
      this.state = State.IDLE;
    }
  }

  async executeBack(): Promise<any> {
    const promises = [];

    let promise =
      this.tasks.length - 1 >= 0 ? this.tasks[this.tasks.length - 1] : null;
    while (promise !== null) {
      if (this.currentlyHandled < this.options.concurrent) {
        this.currentlyHandled++;
        this.tasks.splice(this.tasks.length - 1);
        promises.push(
          Promise.resolve(promise())
            .then((value) => {
              return value;
            })
            .catch((error) => {
              return error;
            })
            .finally(() => {
              this.finalize();
            })
        );
      } else {
        break;
      }
      promise =
        this.tasks.length - 1 >= 0 ? this.tasks[this.tasks.length - 1] : null;
    }

    // Note: Promise.all will reject if any of the concurrent promises fail,
    // regardless if they are all finished yet! This is why we are emitting
    // events per task (and not per batch of tasks with respect to
    // `concurrent`):
    const output = await Promise.all(promises);

    return this.options.concurrent === 1 ? output[0] : output;
  }

  async executeFront(): Promise<any> {
    const promises = [];

    let promise = this.tasks.length >= 0 ? this.tasks[0] : null;
    while (promise !== null) {
      if (this.currentlyHandled < this.options.concurrent) {
        this.currentlyHandled++;
        this.tasks.splice(0, 1);
        promises.push(
          Promise.resolve(promise())
            .then((value) => {
              return value;
            })
            .catch((error) => {
              return error;
            })
            .finally(() => {
              this.finalize();
            })
        );
      } else {
        break;
      }
      promise = this.tasks.length >= 0 ? this.tasks[0] : null;
    }

    // Note: Promise.all will reject if any of the concurrent promises fail,
    // regardless if they are all finished yet! This is why we are emitting
    // events per task (and not per batch of tasks with respect to
    // `concurrent`):
    const output = await Promise.all(promises);

    return this.options.concurrent === 1 ? output[0] : output;
  }

  popBack(): Promise<any> {
    const { interval } = this.options;

    return new Promise<any>((resolve, reject) => {
      const timeout = Math.max(0, interval - (Date.now() - this.lastRan));

      const worker: Worker = new Worker(
        "data:application/javascript," + encodeURIComponent(workerCode)
      );

      worker.addEventListener("message", () => {
        this.lastRan = Date.now();
        this.executeBack()
          .then(resolve)
          .catch((e) => {
            reject(e);
          });
      });

      worker.postMessage({ timeout });
    });
  }

  popFront(): Promise<any> {
    const { interval } = this.options;

    return new Promise<any>((resolve, reject) => {
      const timeout = Math.max(0, interval - (Date.now() - this.lastRan));

      const worker: Worker = new Worker(
        "data:application/javascript," + encodeURIComponent(workerCode)
      );

      worker.addEventListener("message", () => {
        this.lastRan = Date.now();
        this.executeFront()
          .then(resolve)
          .catch((e) => {
            reject(e);
          });
      });

      worker.postMessage({ timeout });
    });
  }

  pushBack(tasks: Function | Array<Function>): void {
    if (Array.isArray(tasks)) {
      tasks.map((task) => this.pushBack(task));
      return;
    }

    if (typeof tasks !== "function") {
      throw new Error(`You must provide a function, not ${typeof tasks}.`);
    }

    this.tasks.push(tasks);
  }

  pushFront(tasks: Function | Array<Function>): void {
    if (Array.isArray(tasks)) {
      tasks.map((task) => this.pushFront(task));
      return;
    }

    if (typeof tasks !== "function") {
      throw new Error(`You must provide a function, not ${typeof tasks}.`);
    }

    this.tasks.unshift(tasks);
  }

  clear(): void {
    this.tasks = [];
  }

  get size(): number {
    return this.tasks.length;
  }

  get isEmpty(): boolean {
    return this.size === 0;
  }

  get shouldRun(): boolean {
    return !this.isEmpty && this.state !== State.STOPPED;
  }
}
