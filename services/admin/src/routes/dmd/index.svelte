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

<br />
<br />
Base:
<br />
{#each base as task}
  {task.fileName}
  <br />
{/each}

<br />
<br />
Parsing:
<br />
{#each parsing as task}
  {task.fileName}
  <br />
{/each}

<br />
<br />
Parse Completed:
<br />
{#each parsed as task}
  {task.fileName}
  <br />
{/each}

<br />
<br />
Updating:
<br />
{#each updating as task}
  {task.fileName}
  <br />
{/each}

<br />
<br />
Update Completed:
<br />
{#each updated as task}
  {task.fileName}
  <br />
{/each}
