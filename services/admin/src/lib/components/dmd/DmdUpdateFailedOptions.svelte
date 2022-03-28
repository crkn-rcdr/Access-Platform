<script lang="ts">
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import { showConfirmation } from "$lib/utils/confirmation";
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import { onMount } from "svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   *  @type { DMDTask } The DMDTask being processed.
   */
  export let dmdTask: DMDTask;

  let githubLink = "";

  async function handleTryAgainPressed() {
    await showConfirmation(
      async () => {
        try {
          // reset task to validated and refresh
          await $session.lapin.mutation("dmdTask.resetStorageResult", {
            id: dmdTask.id,
            user: $session.user,
          });
          window.location.reload();
          return {
            success: true,
          };
        } catch (e) {
          return {
            success: false,
            details: e?.message,
          };
        }
      },
      "",
      "Error: failed to reset task.",
      true
    );
  }

  onMount(() => {
    let failedSlugs: string[] = [];

    for (let item of dmdTask["items"]) {
      if (!item.stored) {
        failedSlugs.push(`| ${item.id} | ${item.message} |`);
      }
    }

    const newLine = "%0A";
    const title = "title=DMD Task Failing";
    const label = "labels[]=bug";
    const date = new Date().toISOString();
    const userName = $session.user.name;
    const issueTable = `| Item | Error Message |${newLine}| ------------- | ------------- |`;
    const erroredSlugs = failedSlugs.join(newLine);
    const body = `body=Task Id: ${dmdTask.id}${newLine}${newLine}Link: https://access.canadiana.ca/dmd/${dmdTask.id}${newLine}${newLine}When: ${date}${newLine}${newLine}Who: ${userName}${newLine}${newLine}Issues:${newLine}${issueTable}${newLine}${erroredSlugs}${newLine}${newLine}Please attach a screenshot:${newLine}(drag and drop it here)${newLine}`;

    githubLink =
      `https://github.com/crkn-rcdr/Access-Platform/issues/new?${title}&${body}&${label}`.replace(
        " ",
        "+"
      );
  });
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}

  <NotificationBar
    message={`There was a problem storing the metadata for one or more of your items. Please check the results in the table below for details about the problem. You can 1) Try running the update again, <a href="/dmd/new" target="_blank">2) Correct any formatting issues in the input file and upload it again</a>, or <a href="${githubLink}" target="_blank">3) Open a ticket for the platform team to investigate the problem.</a>`}
    status="fail"
  />
  <br />
  <button on:click={handleTryAgainPressed} class="secondary">Try Again</button>
  <br />
  <br />
{/if}
