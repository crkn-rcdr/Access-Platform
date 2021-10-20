/**
 * @module dmdTasksStore
 * @description
 * This module exports a store of type DmdTasksCache that holds DmdTaskStates. This makes it easier for the components to interact with a dmd task and keep track of states throughout the progression of updating the items in the dmd task.
 */

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
  let index = 0;
  for (const itemSlug in items) {
    if (items[itemSlug].shouldUpdate) {
      try {
        const res = await lapin.mutation("dmdTask.storeAccess", {
          task: dmdTaskId,
          index,
          slug: items[itemSlug].slug,
          user: user,
        });
        console.log("access res:", res);
        items[itemSlug].updatedInAccess = "Yes";
        items[itemSlug].updatedInAccessMsg =
          "Metadata file updated successfully.";
        updateTask(dmdTaskId, "itemStates", items);

        const percentage = Math.round(((index + 1) / numItems) * 100);
        updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
        if (percentage === 100) updateTask(dmdTaskId, "updateState", "updated");
      } catch (e) {
        console.log("access e:", e);
        items[itemSlug].updatedInAccess = "No";
        if (!items[itemSlug].updatedInAccessMsg.length) {
          items[itemSlug].updatedInAccessMsg = e?.message;
          updateTask(dmdTaskId, "itemStates", items);
        }

        const percentage = Math.round(((index + 1) / numItems) * 100);
        updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
        if (percentage === 100) updateTask(dmdTaskId, "updateState", "updated");
      }
    } else {
      //items[itemSlug].updatedInAccess = "No";
      //updateTask(dmdTaskId, "itemStates", items);
      const percentage = Math.round(((index + 1) / numItems) * 100);
      updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
      if (percentage === 100) updateTask(dmdTaskId, "updateState", "updated");
    }
    index++;
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
  let index = 0;
  for (const itemSlug in items) {
    if (items[itemSlug].shouldUpdate) {
      try {
        const res = await lapin.mutation("wipmeta.storePreservation", {
          task: dmdTaskId,
          index,
          id: items[itemSlug].slug,
        });
        console.log("pres r:", res);
        items[itemSlug].updatedInPreservation = "Yes";
        items[itemSlug].updatedInPreservationMsg =
          "Metadata file updated successfully.";
        updateTask(dmdTaskId, "itemStates", items);

        const percentage = Math.round(
          (((index + 1) * (isUpdatingInAccessToo ? 2 : 1)) / numItems) * 100
        );
        updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
        if (percentage === 100) updateTask(dmdTaskId, "updateState", "updated");
      } catch (e) {
        console.log("pres e:", e);
        items[itemSlug].updatedInPreservation = "No";
        items[itemSlug].updatedInPreservationMsg = e?.message;
        updateTask(dmdTaskId, "itemStates", items);

        const percentage = Math.round(
          (((index + 1) * (isUpdatingInAccessToo ? 2 : 1)) / numItems) * 100
        );
        updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
        if (percentage === 100) updateTask(dmdTaskId, "updateState", "updated");
      }
    } else {
      //items[itemSlug].updatedInPreservation = "No";
      //updateTask(dmdTaskId, "itemStates", items);

      const percentage = Math.round(
        (((index + 1) * (isUpdatingInAccessToo ? 2 : 1)) / numItems) * 100
      );
      updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
      if (percentage === 100) updateTask(dmdTaskId, "updateState", "updated");
    }
    index++;
  }
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
  lapin: TRPCClient<LapinRouter>,
  prefix: string
) {
  updateTask(dmdTaskId, "updateState", "updating");
  updateTask(dmdTaskId, "updatedProgressPercentage", 0);

  const dmdTask = getTask(dmdTaskId);

  let items = dmdTask.itemStates;

  const numItems = getTaskItemLength(
    dmdTaskId,
    items,
    (dmdTaskId, itemSlug, items) => {
      items[itemSlug].updatedInAccessMsg = "";
      items[itemSlug].updatedInPreservationMsg = "";

      if (
        dmdTask.shouldUpdateInAccess &&
        items[itemSlug].updatedInAccess !== "Yes"
      )
        items[itemSlug].updatedInAccess = "Updating...";
      if (
        dmdTask.shouldUpdateInPreservation &&
        items[itemSlug].updatedInPreservation !== "Yes"
      )
        items[itemSlug].updatedInPreservation = "Updating...";

      const prefixedSlug =
        prefix !== "none" ? `${prefix}.${itemSlug}` : itemSlug;
      items[itemSlug].slug = prefixedSlug;

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

  for (const itemSlug in items) {
    items[itemSlug].shouldUpdate = false;
    if (
      dmdTask.shouldUpdateInAccess &&
      items[itemSlug].updatedInAccess === "No"
    )
      items[itemSlug].shouldUpdate = true;
    if (
      dmdTask.shouldUpdateInPreservation &&
      items[itemSlug].updatedInPreservation === "No"
    )
      items[itemSlug].shouldUpdate = true;
  }
}

/**
 * Sets all items in DmdTasksCache[dmdTaskId]'s shouldUpdate field to the @param shouldUpdate. (This controls if the update methods actually run for that item.) This method enables a toggle all feature.
 * @param dmdTaskId
 * @param shouldUpdate
 */
function toggleAllItemsSelected(dmdTaskId: string, shouldUpdate: boolean) {
  const dmdTask = getTask(dmdTaskId);
  let items = dmdTask.itemStates;
  for (const itemSlug in items) {
    if (
      !(
        (dmdTask.shouldUpdateInAccess &&
          items[itemSlug].updatedInAccess === "Yes") ||
        (dmdTask.shouldUpdateInPreservation &&
          items[itemSlug].updatedInAccess === "Yes")
      )
    )
      items[itemSlug].shouldUpdate = shouldUpdate;
    console.log(dmdTask.shouldUpdateInAccess);
    console.log(items[itemSlug].updatedInAccess === "Yes");
    console.log(dmdTask.shouldUpdateInPreservation);
    console.log(items[itemSlug].updatedInAccess === "Yes");
    console.log(items[itemSlug].shouldUpdate);
    console.log("");
    console.log("");
  }
  updateTask(dmdTaskId, "itemStates", items);
}

/**
 * Returns if all items in DmdTasksCache[dmdTaskId] have shouldUpdate set to true or not.
 * @param dmdTaskId
 * @param shouldUpdate
 */
function checkIfAllTaskItemsSelected(dmdTaskId: string): boolean {
  const dmdTask = getTask(dmdTaskId);
  let items = dmdTask.itemStates;
  let areAllItemsSelected = true;
  for (const itemSlug in items) {
    if (
      !(
        (dmdTask.shouldUpdateInAccess &&
          items[itemSlug].updatedInAccess === "Yes") ||
        (dmdTask.shouldUpdateInPreservation &&
          items[itemSlug].updatedInAccess === "Yes")
      ) &&
      items[itemSlug].parseSuccess
    )
      areAllItemsSelected = areAllItemsSelected && items[itemSlug].shouldUpdate;
  }
  return areAllItemsSelected;
}

export const dmdTasksStore = {
  ...store,
  setTask,
  initializeTask,
  getTask,
  updateTask,
  storeTaskItemMetadata,
  toggleAllItemsSelected,
  checkIfAllTaskItemsSelected,
};
