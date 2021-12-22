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
    if (items[itemSlug].shouldUpdate) {
      numItems++;
      if (method !== undefined) method(dmdTaskId, itemSlug, items);
    }
  }
  return numItems;
}

/**
 * A helper method to slow down the rate of requests going to the backend. Causes the script to pause for 'ms.'
 * @param ms
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls the lapin routes to update the items metadata and updates DmdTasksCache[dmdTaskId] with the results and progress %.
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
  const dmdTask = getTask(dmdTaskId);

  let items = dmdTask.itemStates;

  const numItems = getTaskItemLength(
    dmdTaskId,
    items,
    // Might as well reset the state for all items to be updated in the same loop.
    (dmdTaskId, itemSlug, items) => {
      items[itemSlug].updatedInAccessMsg = "";
      items[itemSlug].updatedInPreservationMsg = "";

      const prefixedSlug =
        prefix !== "none" ? `${prefix}.${itemSlug}` : itemSlug;
      items[itemSlug].slug = prefixedSlug;

      updateTask(dmdTaskId, "itemStates", items);
    }
  );

  if (numItems === 0) return;

  updateTask(dmdTaskId, "updateState", "updating");
  updateTask(dmdTaskId, "updatedProgressPercentage", 0);
  updateTask(dmdTaskId, "resultMsg", "");

  let index = 0;
  let numUpdated = 0;
  let failedSlugs: string[] = [];

  for (const item of dmdTask.task.items) {
    // To cause the process order to always match the drawn order.
    const itemSlug = item.id;
    // Only run on items the user selects
    if (items[itemSlug]?.shouldUpdate) {
      // Shows a loader
      items[itemSlug].updatedInAccess = "Updating";
      items[itemSlug].updatedInPreservation = "Updating";
      updateTask(dmdTaskId, "itemStates", items);

      // Taking a pause to conserve resources
      await sleep(10000);

      // Deselect item
      items[itemSlug].shouldUpdate = false;
      updateTask(dmdTaskId, "itemStates", items);

      // Updating ACCESS
      if (dmdTask.shouldUpdateInAccess) {
        try {
          const res = await lapin.mutation("dmdTask.storeAccess", {
            task: dmdTaskId,
            index,
            slug: items[itemSlug].slug,
            user: user,
          });
          //console.log("access res:", res);
          items[itemSlug].updatedInAccess = "Yes";
          items[itemSlug].updatedInAccessMsg =
            "Metadata file updated successfully.";
          updateTask(dmdTaskId, "itemStates", items);
        } catch (e) {
          console.log("access e:", e);
          items[itemSlug].updatedInAccess = "No";
          items[itemSlug].updatedInAccessMsg = e?.message;
          // Make any errored items selected again upon completed
          items[itemSlug].shouldUpdate = true;
          updateTask(dmdTaskId, "itemStates", items);

          failedSlugs.push(`| ${itemSlug} | ${e?.message} |`);
        }
      } else {
        items[itemSlug].updatedInAccess = "No";
        updateTask(dmdTaskId, "itemStates", items);
      }

      // Updating PRESERVATION
      if (dmdTask.shouldUpdateInPreservation) {
        try {
          const res = await lapin.mutation("wipmeta.storePreservation", {
            task: dmdTaskId,
            index,
            id: items[itemSlug].slug,
          });
          //console.log("pres r:", res);
          items[itemSlug].updatedInPreservation = "Yes";
          items[itemSlug].updatedInPreservationMsg =
            "Metadata file updated successfully.";
          updateTask(dmdTaskId, "itemStates", items);
        } catch (e) {
          console.log("pres e:", e);
          items[itemSlug].updatedInPreservation = "No";
          items[itemSlug].updatedInPreservationMsg = e?.message;
          // Make any errored items selected again upon completed
          items[itemSlug].shouldUpdate = true;
          updateTask(dmdTaskId, "itemStates", items);

          failedSlugs.push(`| ${itemSlug} | ${e?.message} |`);
        }
      } else {
        items[itemSlug].updatedInPreservation = "No";
        updateTask(dmdTaskId, "itemStates", items);
      }

      // For progress count
      numUpdated++;
    } else {
      items[itemSlug].updatedInAccess = "No";
      items[itemSlug].updatedInPreservation = "No";
      items[itemSlug].updatedInPreservationMsg = "";
      items[itemSlug].updatedInAccessMsg = "";
      updateTask(dmdTaskId, "itemStates", items);
    }

    // Update progress bar
    const percentage = Math.round((numUpdated / numItems) * 100);
    updateTask(dmdTaskId, "updatedProgressPercentage", percentage);
    /*console.log("percentage ", percentage);
    console.log("numUpdated ", numUpdated);
    console.log("numItems ", numItems);*/

    index++;
  }

  if (failedSlugs.length) {
    const newLine = "%0A";
    const title = "title=DMD Task Failing";
    const label = "labels[]=bug";
    const date = new Date().toISOString();
    const userName = user.name;
    const issueTable = `| Item | Error Message |${newLine}| ------------- | ------------- |`;
    const erroredSlugs = failedSlugs.join(newLine);
    const body = `body=Task Id: ${dmdTaskId}${newLine}${newLine}Link: https://access.canadiana.ca/dmd/${dmdTaskId}${newLine}${newLine}When: ${date}${newLine}${newLine}Who: ${userName}${newLine}${newLine}Issues:${newLine}${issueTable}${newLine}${erroredSlugs}${newLine}${newLine}Please attach a screenshot:${newLine}(drag and drop it here)${newLine}`;

    const githubLink =
      `https://github.com/crkn-rcdr/Access-Platform/issues/new?${title}&${body}&${label}`.replace(
        " ",
        "+"
      );

    updateTask(dmdTaskId, "updateState", "error");
    updateTask(
      dmdTaskId,
      "resultMsg",
      `There was a problem updating one or more of your items metadata files. Please check the results in the table below for details about the problem. You can 1) Try running the update again, <a href="/dmd/new" target="_blank">2) Correct any formatting issues in the input file and upload it again</a>, or <a href="${githubLink}" target="_blank">3) Open a ticket for the platform team to investigate the problem.</a>`
    );
  } else {
    const newLine = "%0A";
    const title = "title=DMD Task Item Updates Not Propagating";
    const label = "labels[]=bug";
    const date = new Date().toISOString();
    const userName = user.name;
    const body = `body=Task Id: ${dmdTaskId}${newLine}${newLine}Link: https://access.canadiana.ca/dmd/${dmdTaskId}${newLine}${newLine}When: ${date}${newLine}${newLine}Who: ${userName}${newLine}${newLine}Affected Slugs:${newLine}(Please type the affected slugs here)${newLine}${newLine}Or, please attach a screenshot:${newLine}(drag and drop it here)${newLine}`;

    const githubLink =
      `https://github.com/crkn-rcdr/Access-Platform/issues/new?${title}&${body}&${label}`.replace(
        " ",
        "+"
      );

    updateTask(dmdTaskId, "updateState", "updated");
    updateTask(
      dmdTaskId,
      "resultMsg",
      `Success! All of the metadata files were updated for the selected items. Please wait up to one hour to see the new metadata updated in access and/or preservation. <a href="${githubLink}" target="_blank">If after one hour the updates still aren't visible, open a ticket for the platform team to investigate the problem.</a>`
    );
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
