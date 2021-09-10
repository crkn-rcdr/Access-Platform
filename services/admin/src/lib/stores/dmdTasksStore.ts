import type { DmdItemStates, DmdTasksCache, DmdTaskState } from "$lib/types";
import { get, writable } from "svelte/store";
import type { TRPCClient } from "@trpc/client";
import type { LapinRouter } from "../../../../../packages/lapin-router/dist/esm";
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

async function lookupTaskItemsInAccessSubset(
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

async function lookupTaskItemsInPreservation(
  prefix: string,
  dmdTaskId: string,
  items: DmdItemStates,
  lapin: TRPCClient<LapinRouter>
) {
  const slugs = Object.keys(items);
  for (const slug of slugs) {
    try {
      const id = prefix !== "none" ? `${prefix}.${slug}` : slug;
      const response = await lapin.query("wipmeta.find", id);
      if (response) {
        items[slug].foundInPreservation = "Yes";
      } else {
        items[slug].foundInPreservation = "No";
      }
      updateTask(dmdTaskId, "itemStates", items);
    } catch (e) {
      console.log(e?.message);
      items[slug].foundInPreservation = "No";
    }
  }
}

async function updateItemsInAccess(
  dmdTaskId: string,
  items: DmdItemStates,
  user: User,
  lapin: TRPCClient<LapinRouter>,
  numItems: number
) {
  let index = 0;
  for (const itemSlug in items) {
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

    const percentage = Math.round(((index + 1) / numItems) * 100);

    updateTask(dmdTaskId, "updatedProgressPercentage", percentage);

    index++;
  }
}

async function updateItemsInPreservation(
  dmdTaskId: string,
  items: DmdItemStates,
  lapin: TRPCClient<LapinRouter>,
  numItems: number,
  isUpdatingInAccessToo: boolean
) {
  let index = 0;
  for (const itemSlug in items) {
    if (
      items[itemSlug].foundInPreservation === "Yes" &&
      items[itemSlug].shouldUpdate &&
      items[itemSlug].parseSuccess
    ) {
      try {
        await lapin.mutation("wipmeta.storePreservation", {
          task: dmdTaskId,
          index,
          id: items[itemSlug]["slug"],
        });
        items[itemSlug].updatedInPreservation = "Yes";
        updateTask(dmdTaskId, "itemStates", items);
        updateTask(dmdTaskId, "itemStates", items);
      } catch (e) {
        console.log(e?.message);
        items[itemSlug].updatedInPreservation = "No";
        updateTask(dmdTaskId, "itemStates", items);
      }
    } else {
      items[itemSlug].updatedInPreservation = "No";
      updateTask(dmdTaskId, "itemStates", items);
    }

    const percentage = Math.round(
      (((index + 1) * (isUpdatingInAccessToo ? 2 : 1)) / numItems) * 100
    );

    updateTask(dmdTaskId, "updatedProgressPercentage", percentage);

    index++;
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
        items[itemSlug].foundInPreservation = "Searching...";
        updateTask(dmdTaskId, "itemStates", items);
      }
    );

    for (const itemSlug in items) {
      slugs.push(itemSlug);
      if ((index !== 0 && index % 100 === 0) || index === numItems - 1) {
        await lookupTaskItemsInAccessSubset(
          prefix,
          dmdTaskId,
          items,
          slugs,
          lapin
        );
        slugs = [];
      }
      index++;
    }

    await lookupTaskItemsInPreservation(prefix, dmdTaskId, items, lapin);

    updateTask(dmdTaskId, "itemStates", items);
    updateTask(dmdTaskId, "lookupState", "loaded");
  },
  storeTaskItemsToSwift: async (
    dmdTaskId: string,
    user: User,
    lapin: TRPCClient<LapinRouter>
  ) => {
    updateTask(dmdTaskId, "updateState", "updating");
    updateTask(dmdTaskId, "updatedProgressPercentage", 0);

    const dmdTask = getTask(dmdTaskId);

    let items = dmdTask.itemStates;

    const numItems = getTaskItemLength(
      dmdTaskId,
      items,
      (dmdTaskId, itemSlug, items) => {
        if (dmdTask.shouldUpdateInAccess)
          items[itemSlug].updatedInAccess = "Updating...";
        if (dmdTask.shouldUpdateInPreservation)
          items[itemSlug].updatedInPreservation = "Updating...";
        updateTask(dmdTaskId, "itemStates", items);
      }
    );

    const totalNumRequests =
      dmdTask.shouldUpdateInAccess && dmdTask.shouldUpdateInPreservation
        ? numItems * 2
        : numItems;

    if (dmdTask.shouldUpdateInAccess)
      await updateItemsInAccess(
        dmdTaskId,
        items,
        user,
        lapin,
        totalNumRequests
      );

    if (dmdTask.shouldUpdateInPreservation)
      await updateItemsInPreservation(
        dmdTaskId,
        items,
        lapin,
        totalNumRequests,
        dmdTask.shouldUpdateInAccess
      );

    updateTask(dmdTaskId, "itemStates", items);
    updateTask(dmdTaskId, "updateState", "updated");
  },
  toggleAllItemsSelected: (
    dmdTaskId: string,
    shouldUpdateAllItems: boolean
  ) => {
    let items = getTask(dmdTaskId).itemStates;
    for (const itemSlug in items) {
      items[itemSlug].shouldUpdate = shouldUpdateAllItems;
    }
    updateTask(dmdTaskId, "itemStates", items);
  },
  checkIfAllTaskItemsSelected: (dmdTaskId: string): boolean => {
    let items = getTask(dmdTaskId).itemStates;
    let areAllItemsSelected = true;
    for (const itemId in items) {
      areAllItemsSelected = areAllItemsSelected && items[itemId].shouldUpdate;
    }
    return areAllItemsSelected;
  },
  toggleDmdTaskItemAccessState: (dmdTaskId: string) => {
    let items = getTask(dmdTaskId).itemStates;
    for (const itemSlug in items) {
      items[itemSlug].foundInAccess = "No";
      items[itemSlug].updatedInAccess = "No";
    }
    updateTask(dmdTaskId, "itemStates", items);
  },
  toggleDmdTaskItemPreservationState: (dmdTaskId: string) => {
    let items = getTask(dmdTaskId).itemStates;
    for (const itemSlug in items) {
      items[itemSlug].foundInPreservation = "No";
      items[itemSlug].updatedInPreservation = "No";
    }
    updateTask(dmdTaskId, "itemStates", items);
  },
};
