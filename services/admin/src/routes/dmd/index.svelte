<script context="module" lang="ts">
  import type { ShortTask } from "@crkn-rcdr/access-data";
  /**
   * @module
   * @description loads in the object from the backend using the params in the route of the page
   */

  function getDMDTasks(taskList) {
    const base: ShortTask[] = [];
    const parsing: ShortTask[] = [];
    const parsed: ShortTask[] = [];
    const updating: ShortTask[] = [];
    const paused: ShortTask[] = [];
    const updated: ShortTask[] = [];

    // todo test
    /*
    const list = taskList.sort((a, b) => {
      if (a.date > b.date) return 1;
      else if (a.date < b.date) return -1;
      return 0;
    });*/

    for (const task of taskList) {
      if (task.type === "store paused") {
        paused.push(task);
      } else if (
        task.type === "store succeeded" ||
        task.type === "store failed"
      ) {
        updated.push(task);
      } else if (task.type === "store queued" || task.type === "storing") {
        updating.push(task);
      } else if (
        task.type === "parse succeeded" ||
        task.type === "parse failed"
      ) {
        parsed.push(task);
      } else if (task.type === "parse queued" || task.type === "parsing") {
        parsing.push(task);
      } else {
        base.push(task);
      }
    }

    return {
      props: { base, parsed, parsing, updating, updated, paused },
    };
  }
</script>

<script lang="ts">
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import timer from "$lib/stores/timer";
  import { onDestroy, onMount } from "svelte";
  import ExpansionList from "$lib/components/shared/ExpansionList.svelte";
  import ExpansionListItem from "$lib/components/shared/ExpansionListItem.svelte";
  import ExpansionListMessage from "$lib/components/shared/ExpansionListMessage.svelte";
  import DmdTaskActions from "$lib/components/dmd/DmdTaskActions.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";

  // Typed arrays lets us avoid checks in the front end
  export let base: ShortTask[] = [];
  export let parsing: ShortTask[] = [];
  export let parsed: ShortTask[] = [];
  export let updating: ShortTask[] = [];
  export let paused: ShortTask[] = [];
  export let updated: ShortTask[] = [];

  let loading = true;

  let unsubscribe;
  const interval = timer({ interval: 60000 }); // 1x per min

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  async function handleDeletePressed(array, task) {
    array = array.filter((item) => task["id"] === item["id"]);
    await getDMDTasksList();
  }

  async function getDMDTasksList() {
    let taskList: ShortTask[] = await $session.lapin.query("dmdTask.list");
    const results = getDMDTasks(taskList);
    ({ base, parsed, parsing, updating, updated, paused } = results.props);
    loading = false;
  }

  onMount(() => {
    getDMDTasksList().then(() => {
      unsubscribe = interval.subscribe(async () => {
        await getDMDTasksList();
      });
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>

{#if loading}
  <br />
  <br />
  <br />
  <div
    class="auto-align auto-align__column auto-align__block auto-align__a-center"
  >
    <Loading backgroundType="gradient" />
    <p>Fetching metadata tasks...</p>
  </div>
{:else}
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
        <span slot="title">Unable to Trigger Parse ({base.length})</span>
        {#each base as task}
          <ExpansionListItem status="N/A">
            <span slot="title">{task.fileName}</span>
            <span slot="actions">
              <DmdTaskActions
                {task}
                stage="N/A"
                status="N/A"
                on:delete={async () => {
                  await handleDeletePressed(base, task);
                }}
              />
            </span>
          </ExpansionListItem>
        {/each}
      </ExpansionList>
    {/if}

    <ExpansionList
      showMessage={parsing?.length === 0}
      message="No tasks are parsing."
    >
      <span slot="title">Parsing ({parsing.length})</span>
      {#each parsing as task}
        <ExpansionListItem status="waiting">
          <span slot="title">{task.fileName}</span>
          <span slot="date"
            >{new Date(task.date)
              .toLocaleString()
              .replace(/:[0-9][0-9]$/, "")}</span
          >
          <span slot="actions">
            <DmdTaskActions
              {task}
              stage="parse"
              status="waiting"
              on:delete={async () => {
                await handleDeletePressed(parsing, task);
              }}
            />
          </span>
        </ExpansionListItem>
      {/each}
    </ExpansionList>

    <ExpansionList
      showMessage={parsed?.length === 0}
      message="No tasks have been parsed."
    >
      <span slot="title">Parsed ({parsed.length})</span>
      {#each parsed as task}
        <ExpansionListItem
          status={task.type === "parse succeeded"
            ? task.message?.length
              ? "warning"
              : "succeeded"
            : "failed"}
        >
          <span slot="title">{task.fileName}</span>
          <span slot="date"
            >{new Date(task.date)
              .toLocaleString()
              .replace(/:[0-9][0-9]$/, "")}</span
          >
          <span slot="details">
            {task.count} items
          </span>
          <span slot="actions">
            <DmdTaskActions
              {task}
              stage="parse"
              status={task.type === "parse succeeded" ? "succeeded" : "failed"}
              on:delete={async () => {
                await handleDeletePressed(parsed, task);
              }}
            />
          </span>
        </ExpansionListItem>
        <ExpansionListMessage
          status={task.type === "parse succeeded" ? "succeeded" : "failed"}
          message={task.message}
        />
      {/each}
    </ExpansionList>

    <ExpansionList
      showMessage={updating?.length === 0}
      message="No tasks are loading."
    >
      <span slot="title">Loading ({updating.length})</span>
      {#each updating as task}
        <ExpansionListItem status="waiting">
          <span slot="title">{task.fileName}</span>
          <span slot="date"
            >{new Date(task.date)
              .toLocaleString()
              .replace(/:[0-9][0-9]$/, "")}</span
          >
          <span slot="details">{task.count} items</span>
          <span slot="actions">
            <DmdTaskActions
              {task}
              stage="load"
              status="waiting"
              on:delete={async () => {
                await handleDeletePressed(updating, task);
              }}
            />
          </span>
        </ExpansionListItem>
      {/each}
    </ExpansionList>

    <ExpansionList
      showMessage={paused?.length === 0}
      message="No tasks have been paused."
    >
      <span slot="title">Load Paused ({paused.length})</span>
      {#each paused as task}
        <ExpansionListItem status="paused">
          <span slot="title">{task.fileName}</span>
          <span slot="date"
            >{new Date(task.date)
              .toLocaleString()
              .replace(/:[0-9][0-9]$/, "")}</span
          >
          <span slot="details">{task.count} items</span>
          <span slot="actions">
            <DmdTaskActions
              {task}
              stage="load"
              status={"paused"}
              on:delete={async () => {
                await handleDeletePressed(paused, task);
              }}
            />
          </span>
        </ExpansionListItem>
        <ExpansionListMessage status="succeeded" message={task.message} />
      {/each}
    </ExpansionList>

    <ExpansionList
      showMessage={updated?.length === 0}
      message="No tasks have been completed."
    >
      <span slot="title">Load Completed ({updated.length})</span>
      {#each updated as task}
        <ExpansionListItem
          status={task.type === "store succeeded"
            ? task.message?.length
              ? "warning"
              : "succeeded"
            : "failed"}
        >
          <span slot="title">{task.fileName}</span>
          <span slot="date"
            >{new Date(task.date)
              .toLocaleString()
              .replace(/:[0-9][0-9]$/, "")}</span
          >
          <span slot="details">{task.count} items</span>
          <span slot="actions">
            <DmdTaskActions
              {task}
              stage="load"
              status={task.type === "store succeeded" ? "succeeded" : "failed"}
              on:delete={async () => {
                await handleDeletePressed(updated, task);
              }}
            />
          </span>
        </ExpansionListItem>
        <ExpansionListMessage
          status={task.type === "store succeeded" ? "succeeded" : "failed"}
          message={task.message}
        />
      {/each}
    </ExpansionList>
    <br />
    <br />
    <br />
  </div>
{/if}

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
