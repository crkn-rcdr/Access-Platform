<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the object from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput, Session } from "$lib/types";
  import {
    UpdateSucceededDMDTask,
    UpdateFailedDMDTask,
    UpdatingDMDTask,
    ParsedDMDTask,
    ParsingDMDTask,
    DMDTask,
  } from "@crkn-rcdr/access-data";

  function getDMDTasks(taskList) {
    const base: DMDTask[] = [];
    const parsing: ParsingDMDTask[] = [];
    const parsed: ParsedDMDTask[] = [];
    const updating: UpdatingDMDTask[] = [];
    const updated: (UpdateSucceededDMDTask | UpdateFailedDMDTask)[] = [];

    // todo test
    const list = taskList.sort((a, b) => {
      if (a.process?.requestDate > b.process?.requestDate) return 1;
      else if (a.process?.requestDate < b.process?.requestDate) return -1;
      return 0;
    });

    for (const task of list) {
      if (UpdateSucceededDMDTask.safeParse(task).success) {
        updated.push(task as UpdateSucceededDMDTask);
      } else if (UpdateFailedDMDTask.safeParse(task).success) {
        updated.push(task as UpdateFailedDMDTask);
      } else if (UpdatingDMDTask.safeParse(task).success) {
        updating.push(task as UpdatingDMDTask);
      } else if (ParsedDMDTask.safeParse(task).success) {
        parsed.push(task as ParsedDMDTask);
      } else if (ParsingDMDTask.safeParse(task).success) {
        parsing.push(task as ParsingDMDTask);
      } else {
        base.push(task as DMDTask);
      }
    }

    return {
      props: { base, parsed, parsing, updating, updated },
    };
  }

  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      let taskList = await context.lapin.query("dmdTask.list");
      return getDMDTasks(taskList);
    } catch (e) {
      return {
        props: {
          error:
            "Could not get item from the server. Please contact the platform team for assistance.",
        },
      };
    }
  };
</script>

<script lang="ts">
  import { getStores } from "$app/stores";
  import timer from "$lib/stores/timer";
  import { onDestroy, onMount } from "svelte";
  import ExpansionList from "$lib/components/shared/ExpansionList.svelte";
  import ExpansionListItem from "$lib/components/shared/ExpansionListItem.svelte";
  import ExpansionListMessage from "$lib/components/shared/ExpansionListMessage.svelte";
  import DmdTaskActions from "$lib/components/dmd/DmdTaskActions.svelte";

  // Typed arrays lets us avoid checks in the front end
  export let base: DMDTask[] = [];
  export let parsing: ParsingDMDTask[] = [];
  export let parsed: ParsedDMDTask[] = [];
  export let updating: UpdatingDMDTask[] = [];
  export let updated: (UpdateSucceededDMDTask | UpdateFailedDMDTask)[] = [];

  let loading = false;

  let unsubscribe;
  const interval = timer({ interval: 60000 }); // 1x per min

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  async function getDMDTasksList() {
    loading = true;
    let batchList = await $session.lapin.query("dmdTask.list");
    const results = getDMDTasks(batchList);
    ({ base, parsed, parsing, updating, updated } = results.props);
    loading = false;
  }

  onMount(() => {
    unsubscribe = interval.subscribe(async () => {
      await getDMDTasksList();
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>

<div class="wrapper">
  <br />
  <br />
  <br />
  <div class="title auto-align auto-align__a-center">
    <h6>Metadata Tasks</h6>
    <a href="/dmd/new">
      <button class="create-button primary">Parse New Metadata File</button>
    </a>
  </div>
  {#if base.length}
    <ExpansionList showMessage={base?.length === 0} message="">
      <span slot="title">Awaiting Parsing ({base.length})</span>
      {#each base as task}
        <ExpansionListItem status="N/A">
          <span slot="title">{task.fileName}</span>
          <span slot="stage">N/A</span>
          <span slot="actions">
            <DmdTaskActions
              {task}
              isListLoading={loading}
              stage="N/A"
              status="N/A"
              on:delete={getDMDTasks}
            />
          </span>
        </ExpansionListItem>
      {/each}
    </ExpansionList>
  {/if}

  <ExpansionList
    showMessage={parsing?.length === 0}
    message="No batches are exporting."
  >
    <span slot="title">Parsing ({parsing.length})</span>
    {#each parsing as task}
      <ExpansionListItem status="waiting">
        <span slot="title">{task.fileName}</span>
        <span slot="stage">parse</span>
        <span slot="actions">
          <DmdTaskActions
            {task}
            isListLoading={loading}
            stage="parse"
            status="waiting"
            on:delete={getDMDTasks}
          />
        </span>
      </ExpansionListItem>
    {/each}
  </ExpansionList>

  <ExpansionList
    showMessage={parsed?.length === 0}
    message="No batches are exporting."
  >
    <span slot="title">Parsed ({parsed.length})</span>
    {#each parsed as task}
      <ExpansionListItem
        status={task.process.succeeded ? "succeeded" : "failed"}
      >
        <span slot="title">{task.fileName}</span>
        <span slot="stage">parse</span>
        <span slot="details">{task.items.length} items</span>
        <span slot="actions">
          <DmdTaskActions
            {task}
            isListLoading={loading}
            stage="parse"
            status={task.process["succeeded"] ? "succeeded" : "failed"}
            on:delete={getDMDTasks}
          />
        </span>
      </ExpansionListItem>
      <ExpansionListMessage
        status={task.process.succeeded ? "succeeded" : "failed"}
        message={task.process.message}
      />
    {/each}
  </ExpansionList>

  <ExpansionList
    showMessage={updating?.length === 0}
    message="No batches are exporting."
  >
    <span slot="title">Loading ({updating.length})</span>
    {#each updating as task}
      <ExpansionListItem status="waiting">
        <span slot="title">{task.fileName}</span>
        <span slot="stage">load</span>
        <span slot="details">{task.items.length} items</span>
        <span slot="actions">
          <DmdTaskActions
            {task}
            isListLoading={loading}
            stage="load"
            status="waiting"
            on:delete={getDMDTasks}
          />
        </span>
      </ExpansionListItem>
    {/each}
  </ExpansionList>

  <ExpansionList
    showMessage={updated?.length === 0}
    message="No batches are exporting."
  >
    <span slot="title">Load Completed ({updated.length})</span>
    {#each updated as task}
      <ExpansionListItem
        status={task.process.succeeded ? "succeeded" : "failed"}
      >
        <span slot="title">{task.fileName}</span>
        <span slot="stage">load</span>
        <span slot="details">{task.items.length} items</span>
        <span slot="actions">
          <DmdTaskActions
            {task}
            isListLoading={loading}
            stage="load"
            status={task.process["succeeded"] ? "succeeded" : "failed"}
            on:delete={getDMDTasks}
          />
        </span>
      </ExpansionListItem>
      <ExpansionListMessage
        status={task.process.succeeded ? "succeeded" : "failed"}
        message={task.process.message}
      />
    {/each}
  </ExpansionList>
  <br />
  <br />
  <br />
</div>

<style>
  .title {
    width: 100%;
  }
  .title h6 {
    flex: 10;
  }
  .create-button {
    flex: 2;
  }
</style>
