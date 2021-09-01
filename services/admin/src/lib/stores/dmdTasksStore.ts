import { localStore } from "$lib/stores/localSore";
import type { DmdItemStates, DmdTasksCache, DmdTaskState } from "$lib/types";
import { get, writable } from "svelte/store";

const initialDmdTaskMap: DmdTasksCache = new Map();
const store = writable(initialDmdTaskMap); //localStore("crkn-admin-dmd", initialDmdTaskMap);
//:

function update(dmdTaskId: string, key: string, value: any) {
  let dmdTasksCache: DmdTasksCache = get(store);
  dmdTasksCache[dmdTaskId][key] = value;
  store.set(dmdTasksCache);
}

async function initialize(key: string, value: DmdTaskState) {
  let dmdTasksCache: DmdTasksCache = get(store);
  if (!(key in dmdTasksCache)) {
    dmdTasksCache[key] = value;
    store.set(dmdTasksCache);
  }
}

function set(key: string, value: DmdTaskState) {
  let dmdTasksCache: DmdTasksCache = get(store);
  dmdTasksCache[key] = value;
  store.set(dmdTasksCache);
}

function value(key: string): DmdTaskState {
  let dmdTasksCache: DmdTasksCache = get(store);
  return dmdTasksCache[key];
}

export const dmdTasksStore = {
  ...store,
  set,
  initialize,
  value,
  update,
  lookupItems: async (dmdTaskId: string, prefix: string) => {
    update(dmdTaskId, "updateState", "ready");
    update(dmdTaskId, "lookupState", "loading");
    let items = value(dmdTaskId).itemStates;
    console.log("lookup", items, items.entries());
    for (var m in items) {
      console.log(m);
    }
    update(dmdTaskId, "itemStates", items);
    update(dmdTaskId, "lookupState", "loaded");
  },
  storeItemsToSwift: async (dmdTaskId: string) => {
    update(dmdTaskId, "updateState", "updating");
    let items = value(dmdTaskId).itemStates;
    console.log("update", items);
    for (var m in items) {
      console.log(m);
    }
    update(dmdTaskId, "itemStates", items);
    update(dmdTaskId, "updateState", "updated");
  },
};
