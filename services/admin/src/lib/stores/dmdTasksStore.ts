import type { DmdItemStates, DmdTasksCache, DmdTaskState } from "$lib/types";
import { get, writable } from "svelte/store";

const initialDmdTaskMap: DmdTasksCache = new Map();
const store = writable(initialDmdTaskMap);

function updateTask(dmdTaskId: string, key: string, value: any) {
  let dmdTasksCache: DmdTasksCache = get(store);
  dmdTasksCache[dmdTaskId][key] = value;
  store.set(dmdTasksCache);
}

async function initializeTask(key: string, value: DmdTaskState) {
  let dmdTasksCache: DmdTasksCache = get(store);
  if (!(key in dmdTasksCache)) {
    dmdTasksCache[key] = value;
    store.set(dmdTasksCache);
  }
}

function setTask(key: string, value: DmdTaskState) {
  let dmdTasksCache: DmdTasksCache = get(store);
  dmdTasksCache[key] = value;
  store.set(dmdTasksCache);
}

function getTask(key: string): DmdTaskState {
  let dmdTasksCache: DmdTasksCache = get(store);
  return dmdTasksCache[key];
}

export const dmdTasksStore = {
  ...store,
  setTask,
  initializeTask,
  getTask,
  updateTask,
  lookupTaskItems: async (dmdTaskId: string, prefix: string) => {
    updateTask(dmdTaskId, "updateState", "ready");
    updateTask(dmdTaskId, "lookupState", "loading");
    let items = getTask(dmdTaskId).itemStates;
    console.log("lookup", items, items.entries());
    for (var m in items) {
      console.log(m);
    }
    updateTask(dmdTaskId, "itemStates", items);
    updateTask(dmdTaskId, "lookupState", "loaded");
  },
  storeTaskItemsToSwift: async (dmdTaskId: string) => {
    updateTask(dmdTaskId, "updateState", "updating");
    let items = getTask(dmdTaskId).itemStates;
    console.log("update", items);
    for (var m in items) {
      console.log(m);
    }
    updateTask(dmdTaskId, "itemStates", items);
    updateTask(dmdTaskId, "updateState", "updated");
  },
};
