import type { DmdItemState, DmdTasksCache, DmdTaskState } from "$lib/types";
import { get, writable } from "svelte/store";
import type { TRPCClient } from "@trpc/client";
import type {
  LapinContext,
  LapinRouter,
} from "../../../../../packages/lapin-router/dist/esm";

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
  lookupTaskItems: async (
    dmdTaskId: string,
    prefix: string,
    lapin: TRPCClient<LapinRouter>
  ) => {
    if (lapin) {
      updateTask(dmdTaskId, "updateState", "ready");
      updateTask(dmdTaskId, "lookupState", "loading");
      let items = getTask(dmdTaskId).itemStates;
      let index = 0;
      let slugs: string[] = [];

      let numItems = 0;
      for (var itemSlug in items) {
        items[itemSlug].foundInAccess = "Searching...";
        updateTask(dmdTaskId, "itemStates", items);
        numItems++;
      }

      for (var itemSlug in items) {
        slugs.push(itemSlug);
        console.log(index, numItems, index === numItems - 1);
        if ((index !== 0 && index % 100 === 0) || index === numItems - 1) {
          const response = await lapin.query(
            "slug.lookupMany",
            slugs.map((slug) => `${prefix}.${slug}`)
          );
          let resultIndex = 0;
          for (let slug of slugs) {
            if (resultIndex < response.length) {
              let result = response[resultIndex];
              const itemFound = result[1].found;
              if (itemFound && result.length === 2 && "result" in result[1]) {
                const itemData = result[1].result;
                items[slug].noid = itemData.id;
                items[slug].foundInAccess = "Yes";
                updateTask(dmdTaskId, "itemStates", items);
              } else {
                items[slug].foundInAccess = "No";
                updateTask(dmdTaskId, "itemStates", items);
              }
            } else {
              throw "Not every item was searched.";
            }
            resultIndex++;
          }
          slugs = [];
        }
        index++;
      }
      updateTask(dmdTaskId, "itemStates", items);
      updateTask(dmdTaskId, "lookupState", "loaded");
    } else console.log("No lapin router");
    let dmdTasksCache: DmdTasksCache = get(store);
    console.log("dmdTasksCache", dmdTasksCache);
  },
  storeTaskItemsToSwift: async (
    dmdTaskId: string,
    lapin: TRPCClient<LapinRouter>
  ) => {
    if (lapin) {
      updateTask(dmdTaskId, "updateState", "updating");
      let items = getTask(dmdTaskId).itemStates;
      console.log("update", items);
      for (var m in items) {
        console.log(m);
      }
      updateTask(dmdTaskId, "itemStates", items);
      updateTask(dmdTaskId, "updateState", "updated");
    } else console.log("No lapin router");
  },
};
