import { readable } from "svelte/store";

export default function (options = {}) {
  // create a readable store with initial value set to now
  return readable(new Date(), (set) => {
    // the update function sets the latest date
    const update = () => set(new Date());

    // setup an interval timer to update the store's value repeatedly over time
    const interval = setInterval(update, options.interval || 1000);

    // return unsubscribe callback:
    // it will stop the timer when the store is destroyed
    return () => clearInterval(interval);
  });
}
