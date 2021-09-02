import type {
  DmdItemState,
  DmdItemStates,
  DmdTasksCache,
  DmdTaskState,
} from "$lib/types";
import { get, writable } from "svelte/store";
import type { TRPCClient } from "@trpc/client";
import type {
  LapinContext,
  LapinRouter,
} from "../../../../../packages/lapin-router/dist/esm";
import type { User } from "../../../../../packages/data/dist/esm";

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

function getTaskItemLength(
  dmdTaskId: string,
  items: DmdItemStates,
  method: Function | undefined = undefined
): number {
  let numItems = 0;
  for (var itemSlug in items) {
    if (method !== undefined) method(dmdTaskId, itemSlug, items);
    numItems++;
  }
  return numItems;
}

function setLookupTaskItemResult(
  dmdTaskId: string,
  slug: string,
  items: DmdItemStates,
  result: any
) {
  const itemFound = result[1].found;
  if (itemFound && result.length === 2 && "result" in result[1]) {
    const itemData = result[1].result;
    items[slug].slug = itemData.slug;
    items[slug].noid = itemData.id;
    items[slug].foundInAccess = "Yes";
    updateTask(dmdTaskId, "itemStates", items);
  } else {
    items[slug].foundInAccess = "No";
    updateTask(dmdTaskId, "itemStates", items);
  }
}

async function lookupTaskItemsSubset(
  prefix: string,
  dmdTaskId: string,
  items: DmdItemStates,
  slugs: string[],
  lapin: TRPCClient<LapinRouter>
) {
  try {
    const response = await lapin.query(
      "slug.lookupMany",
      prefix !== "none" ? slugs.map((slug) => `${prefix}.${slug}`) : slugs
    );

    let resultIndex = 0;
    for (let slug of slugs) {
      if (resultIndex < response.length) {
        setLookupTaskItemResult(dmdTaskId, slug, items, response[resultIndex]);
      } else {
        throw "Not every item was searched.";
      }
      resultIndex++;
    }
  } catch (e) {
    console.log(e?.message);
    for (let slug of slugs) items[slug].foundInAccess = "No";
  }
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
    updateTask(dmdTaskId, "updateState", "ready");
    updateTask(dmdTaskId, "lookupState", "loading");

    let items = getTask(dmdTaskId).itemStates;
    let index = 0;
    let slugs: string[] = [];

    let numItems = getTaskItemLength(
      dmdTaskId,
      items,
      (dmdTaskId, itemSlug, items) => {
        items[itemSlug].foundInAccess = "Searching...";
        updateTask(dmdTaskId, "itemStates", items);
      }
    );

    for (var itemSlug in items) {
      slugs.push(itemSlug);
      if ((index !== 0 && index % 100 === 0) || index === numItems - 1) {
        await lookupTaskItemsSubset(prefix, dmdTaskId, items, slugs, lapin);
        slugs = [];
      }
      index++;
    }

    updateTask(dmdTaskId, "itemStates", items);
    updateTask(dmdTaskId, "lookupState", "loaded");
  },
  storeTaskItemsToSwift: async (
    dmdTaskId: string,
    user: User,
    lapin: TRPCClient<LapinRouter>
  ) => {
    updateTask(dmdTaskId, "updateState", "updating");

    let items = getTask(dmdTaskId).itemStates;
    let index = 0;

    let numItems = getTaskItemLength(
      dmdTaskId,
      items,
      (dmdTaskId, itemSlug, items) => {
        items[itemSlug].updatedInAccess = "Updating...";
        updateTask(dmdTaskId, "itemStates", items);
      }
    );

    for (var itemSlug in items) {
      if (
        items[itemSlug].foundInAccess === "Yes" &&
        items[itemSlug].shouldUpdate &&
        items[itemSlug].parseSuccess
      ) {
        try {
          await lapin.mutation("dmdTask.storeAccess", {
            task: dmdTaskId,
            index,
            slug: items[itemSlug]["slug"],
            noid: items[itemSlug]["noid"],
            user: user,
          });
          items[itemSlug].updatedInAccess = "Yes";
          updateTask(dmdTaskId, "itemStates", items);
          updateTask(dmdTaskId, "itemStates", items);
        } catch (e) {
          console.log(e?.message);
          items[itemSlug].updatedInAccess = "No";
          updateTask(dmdTaskId, "itemStates", items);
        }
      } else {
        items[itemSlug].updatedInAccess = "No";
        updateTask(dmdTaskId, "itemStates", items);
      }

      updateTask(dmdTaskId, "updatedProgressPercentage", index + 1 / numItems);

      index++;
    }

    updateTask(dmdTaskId, "itemStates", items);
    updateTask(dmdTaskId, "updateState", "updated");
  },
};
