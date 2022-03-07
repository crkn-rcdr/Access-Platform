<script lang="ts">
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import IoMdRefresh from "svelte-icons/io/IoMdRefresh.svelte";
  import IoMdOpen from "svelte-icons/io/IoMdOpen.svelte";
  import type { UpdateSucceededDMDTask } from "@crkn-rcdr/access-data";
  import { onMount } from "svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTask: UpdateSucceededDMDTask;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let githubLink = "";

  async function handleReProcessClicked() {
    // reset task to validated and refresh
    await $session.lapin.mutation("dmdTask.resetStorageResult", {
      task: dmdTask.id,
      user: $session.user,
    });
    window.location.reload();
  }

  onMount(() => {
    const newLine = "%0A";
    const title = "title=DMD Task Item Updates Not Propagating";
    const label = "labels[]=bug";
    const date = new Date().toISOString();
    const userName = $session.user.name;
    const body = `body=Task Id: ${dmdTask.id}${newLine}${newLine}Link: https://access.canadiana.ca/dmd/${dmdTask.id}${newLine}${newLine}When: ${date}${newLine}${newLine}Who: ${userName}${newLine}${newLine}Affected Slugs:${newLine}(Please type the affected slugs here)${newLine}${newLine}Or, please attach a screenshot:${newLine}(drag and drop it here)${newLine}`;

    githubLink =
      `https://github.com/crkn-rcdr/Access-Platform/issues/new?${title}&${body}&${label}`.replace(
        " ",
        "+"
      );
  });

  /*async function handleTest() {
    // reset task to validated and refresh
    await $session.lapin.mutation("dmdTask.updateStorageResults", {
      id: dmdTask.id,
      array: [
        [1, true],
        [0, true],
        [2, true],
      ],
    });
  }*/
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}
  <NotificationBar
    message={`Success! All of the metadata files were updated for the selected items. Please wait up to one hour to see the new metadata updated in access and/or preservation. <a href="${githubLink}" target="_blank">If after one hour the updates still aren't visible, open a ticket for the platform team to investigate the problem.</a>`}
    status="success"
  />
  <br />
  <!-- if preservation update -->
  <!-- then show button to go to old tool-->
  {#if dmdTask.items?.length && dmdTask.items[0].destination === "preservation"}
    <a
      class="finish-preservation"
      href="https://admin.canadiana.ca/packaging "
      target="_blank"
    >
      <button class="primary">
        <span class="auto-align auto-align__a-center">
          <span class="icon"><IoMdOpen /></span>
          Finish Preservation Update
        </span>
      </button>
    </a>
  {/if}
  <button class="secondary" on:click={handleReProcessClicked}>
    <span class="auto-align auto-align__a-center">
      <span class="icon"><IoMdRefresh /></span>
      Re-process File
    </span>
  </button>
  <br />
  <br />
{/if}
