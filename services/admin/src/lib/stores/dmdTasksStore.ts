/**
 * @module dmdTasksStore
 * @description
 * This module exports a store of type DmdTasksCache that holds DmdTaskStates. This makes it easier for the components to interact with a dmd task and keep track of states throughout the progression of updating the items in the dmd task.
 */
//import Queue from "queue-promise";
import Deque from "../utils/deque";
const DEFAULT_QUEUE_DELAY = 10000;
const MAX_RETRY = 5;

import type { DmdItemStates, DmdTasksCache, DmdTaskState } from "$lib/types";
import { get, writable } from "svelte/store";
import type { TRPCClient } from "@trpc/client";
import type { LapinRouter } from "../../../../../packages/lapin-router/dist/esm";
import type { User } from "../../../../../packages/data/dist/esm";

const initialDmdTaskMap: DmdTasksCache = new Map();
const store = writable(initialDmdTaskMap);

/**
 * Updates the key to value the DmdTasksCache[dmdTaskId]
 * @param dmdTaskId
 * @param key
 * @param value
 */
function updateTask(dmdTaskId: string, key: string, value: any) {
  let dmdTasksCache: DmdTasksCache = get(store);
  dmdTasksCache[dmdTaskId][key] = value;
  store.set(dmdTasksCache);
}

/**
 * Calls @function setTask if DmdTasksCache[key] does not exist
 * @param key
 * @param value
 */
function initializeTask(key: string, value: DmdTaskState) {
  let dmdTasksCache: DmdTasksCache = get(store);
  if (!(key in dmdTasksCache)) {
    setTask(key, value);
  }
}

/**
 * Sets DmdTasksCache[key] to value
 * @param key
 * @param value
 */
function setTask(key: string, value: DmdTaskState) {
  let dmdTasksCache: DmdTasksCache = get(store);
  dmdTasksCache[key] = value;
  store.set(dmdTasksCache);
}

/**
 * Gets DmdTasksCache[key]
 * @param key
 */
function getTask(key: string): DmdTaskState {
  let dmdTasksCache: DmdTasksCache = get(store);
  return dmdTasksCache[key];
}

/**
 * A helper method to get the number of elements in the items DmdItemStates passed in. It will call method on each iteration if it is set. Passing in dmdTaskId, items, and the current slug in the for loop.
 * @param dmdTaskId
 * @param items
 * @param method
 */
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

/**
 * A helper method that takes the result of a lookup request for a singular item, and formats the DmdTasksCache[dmdTaskId]["itemStates"][slug] for that item.
 * @param dmdTaskId
 * @param slug
 * @param items
 * @param result
 */
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

/**
 * A helper method that takes a subset of items in DmdTasksCache[dmdTaskId] and searches for them in the access database through lapin-router.
 * @param prefix
 * @param dmdTaskId
 * @param items
 * @param subsetSlugs
 * @param lapin
 */
async function lookupTaskItemSubsetInAccess(
  prefix: string,
  dmdTaskId: string,
  items: DmdItemStates,
  subsetSlugs: string[],
  lapin: TRPCClient<LapinRouter>
) {
  try {
    const response = await lapin.query(
      "slug.lookupMany",
      prefix !== "none"
        ? subsetSlugs.map((slug) => `${prefix}.${slug}`)
        : subsetSlugs
    );

    let resultIndex = 0;
    for (let slug of subsetSlugs) {
      if (resultIndex < response.length) {
        setLookupTaskItemResult(dmdTaskId, slug, items, response[resultIndex]);
      } else {
        throw "Not every item was searched.";
      }
      resultIndex++;
    }
  } catch (e) {
    console.log(e?.message);
    for (let slug of subsetSlugs) items[slug].foundInAccess = "No";
  }
}

/**
 * A helper method that takes the items in DmdTasksCache[dmdTaskId] and searches for them in the wipmeta database through lapin-router.
 * @param prefix
 * @param dmdTaskId
 * @param items
 * @param lapin
 */
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

async function sendAccessUpdate(
  dmdTaskId: string,
  items: DmdItemStates,
  user: User,
  lapin: TRPCClient<LapinRouter>,
  numItems: number,
  index: number,
  itemSlug: string,
  reqDeque: Deque,
  retryCount: number
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

    const percentage = Math.round(((index + 1) / numItems) * 100);
    updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
  } catch (e) {
    if (retryCount >= MAX_RETRY) {
      items[itemSlug].updatedInAccess = "No";
      items[itemSlug].updatedInAccessMsg = e?.message;
      updateTask(dmdTaskId, "itemStates", items);

      const percentage = Math.round(((index + 1) / numItems) * 100);
      updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
    } else {
      reqDeque.pushFront(() =>
        sendAccessUpdate(
          dmdTaskId,
          items,
          user,
          lapin,
          numItems,
          index,
          itemSlug,
          reqDeque,
          retryCount + 1
        )
      );
    }
  }
}

/**
 * A helper method that one by one, updates the items in DmdTasksCache[dmdTaskId] metadata in the access platform, through lapin-router. Keeps track of the progress as well.
 * @param dmdTaskId
 * @param items
 * @param user
 * @param lapin
 * @param numItems
 */
async function updateItemsInAccess(
  dmdTaskId: string,
  items: DmdItemStates,
  user: User,
  lapin: TRPCClient<LapinRouter>,
  numItems: number
) {
  let reqDeque = new Deque({
    concurrent: 1,
    interval: DEFAULT_QUEUE_DELAY,
    start: false,
  });

  let index = 0;
  for (const itemSlug in items) {
    if (
      items[itemSlug].foundInAccess === "Yes" &&
      items[itemSlug].shouldUpdate &&
      items[itemSlug].parseSuccess
    ) {
      const i = index;
      reqDeque.pushBack(() =>
        sendAccessUpdate(
          dmdTaskId,
          items,
          user,
          lapin,
          numItems,
          i,
          itemSlug,
          reqDeque,
          1
        )
      );
    } else {
      items[itemSlug].updatedInAccess = "No";
      updateTask(dmdTaskId, "itemStates", items);
      const percentage = Math.round(((index + 1) / numItems) * 100);
      updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
    }
    index++;
  }

  reqDeque.startFront();
}

async function sendPreservationUpdate(
  dmdTaskId: string,
  items: DmdItemStates,
  lapin: TRPCClient<LapinRouter>,
  numItems: number,
  index: number,
  itemSlug: string,
  reqDeque: Deque,
  retryCount: number,
  isUpdatingInAccessToo: boolean
) {
  try {
    await lapin.mutation("wipmeta.storePreservation", {
      task: dmdTaskId,
      index,
      id: items[itemSlug]["slug"],
    });
    items[itemSlug].updatedInPreservation = "Yes";
    updateTask(dmdTaskId, "itemStates", items);

    const percentage = Math.round(
      (((index + 1) * (isUpdatingInAccessToo ? 2 : 1)) / numItems) * 100
    );
    updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
  } catch (e) {
    if (retryCount >= MAX_RETRY) {
      items[itemSlug].updatedInPreservation = "No";
      items[itemSlug].updatedInPreservationMsg = e?.message;
      updateTask(dmdTaskId, "itemStates", items);

      const percentage = Math.round(
        (((index + 1) * (isUpdatingInAccessToo ? 2 : 1)) / numItems) * 100
      );
      updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
    } else {
      reqDeque.pushFront(() =>
        sendPreservationUpdate(
          dmdTaskId,
          items,
          lapin,
          numItems,
          index,
          itemSlug,
          reqDeque,
          retryCount + 1,
          isUpdatingInAccessToo
        )
      );
    }
  }
}

/**
 * A helper method that one by one, updates the items in DmdTasksCache[dmdTaskId] metadata in the preservation, through lapin-router. Keeps track of the progress as well.
 * @param dmdTaskId
 * @param items
 * @param lapin
 * @param numItems
 * @param isUpdatingInAccessToo
 */
async function updateItemsInPreservation(
  dmdTaskId: string,
  items: DmdItemStates,
  lapin: TRPCClient<LapinRouter>,
  numItems: number,
  isUpdatingInAccessToo: boolean
) {
  let reqDeque = new Deque({
    concurrent: 1,
    interval: DEFAULT_QUEUE_DELAY,
    start: false,
  });

  let index = 0;
  for (const itemSlug in items) {
    if (
      items[itemSlug].foundInAccess === "Yes" &&
      items[itemSlug].shouldUpdate &&
      items[itemSlug].parseSuccess
    ) {
      const i = index;
      reqDeque.pushBack(() =>
        sendPreservationUpdate(
          dmdTaskId,
          items,
          lapin,
          numItems,
          i,
          itemSlug,
          reqDeque,
          1,
          isUpdatingInAccessToo
        )
      );
    } else {
      items[itemSlug].updatedInPreservation = "No";
      updateTask(dmdTaskId, "itemStates", items);

      const percentage = Math.round(
        (((index + 1) * (isUpdatingInAccessToo ? 2 : 1)) / numItems) * 100
      );
      updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
    }
    index++;
  }
  reqDeque.startFront();
}

/**
 * Calls @function lookupTaskItemSubsetInAccess and @function lookupTaskItemsInPreservation and updates DmdTasksCache[dmdTaskId] with the results.
 * @param dmdTaskId
 * @param prefix
 * @param lapin
 */
async function lookupTaskItems(
  dmdTaskId: string,
  prefix: string,
  lapin: TRPCClient<LapinRouter>
) {
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

  // Batch lookup requests by 100 items.
  for (const itemSlug in items) {
    slugs.push(itemSlug);
    if ((index !== 0 && index % 100 === 0) || index === numItems - 1) {
      await lookupTaskItemSubsetInAccess(
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
}

/**
 * Calls @function updateItemsInAccess and/or @function updateItemsInPreservation and updates DmdTasksCache[dmdTaskId] with the results and progress %.
 * @param dmdTaskId
 * @param prefix
 * @param lapin
 */
async function storeTaskItemMetadata(
  dmdTaskId: string,
  user: User,
  lapin: TRPCClient<LapinRouter>
) {
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
    await updateItemsInAccess(dmdTaskId, items, user, lapin, totalNumRequests);

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
}

/**
 * Sets all items in DmdTasksCache[dmdTaskId]'s shouldUpdate field to the @param shouldUpdate. (This controls if the update methods actually run for that item.) This method enables a toggle all feature.
 * @param dmdTaskId
 * @param shouldUpdate
 */
function toggleAllItemsSelected(dmdTaskId: string, shouldUpdate: boolean) {
  let items = getTask(dmdTaskId).itemStates;
  for (const itemSlug in items) {
    items[itemSlug].shouldUpdate = shouldUpdate;
  }
  updateTask(dmdTaskId, "itemStates", items);
}

/**
 * Returns if all items in DmdTasksCache[dmdTaskId] have shouldUpdate set to true or not.
 * @param dmdTaskId
 * @param shouldUpdate
 */
function checkIfAllTaskItemsSelected(dmdTaskId: string): boolean {
  let items = getTask(dmdTaskId).itemStates;
  let areAllItemsSelected = true;
  for (const itemId in items) {
    areAllItemsSelected = areAllItemsSelected && items[itemId].shouldUpdate;
  }
  return areAllItemsSelected;
}

export const dmdTasksStore = {
  ...store,
  setTask,
  initializeTask,
  getTask,
  updateTask,
  lookupTaskItems,
  storeTaskItemMetadata,
  toggleAllItemsSelected,
  checkIfAllTaskItemsSelected,
};
