<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the object from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput, Session } from "$lib/types";
  import {
    SucceededDMDTask,
    FailedDMDTask,
    QueuedDMDTask,
    ValidatedDMDTask,
    ValidatingDMDTask,
    DMDTask,
  } from "@crkn-rcdr/access-data";

  function getDMDTasks(taskList) {
    const base: DMDTask[] = [];
    const validating: ValidatingDMDTask[] = [];
    const validated: ValidatedDMDTask[] = [];
    const queued: QueuedDMDTask[] = [];
    const complete: (SucceededDMDTask | FailedDMDTask)[] = [];

    const list = taskList.sort((a, b) => {
      if (a.process.requestDate > b.process.requestDate) return 1;
      else if (a.process.requestDate < b.process.requestDate) return -1;
      return 0;
    });

    for (const task of list) {
      if (SucceededDMDTask.safeParse(task).success) {
        complete.push(task as SucceededDMDTask);
      } else if (FailedDMDTask.safeParse(task).success) {
        complete.push(task as FailedDMDTask);
      } else if (QueuedDMDTask.safeParse(task).success) {
        queued.push(task as QueuedDMDTask);
      } else if (ValidatedDMDTask.safeParse(task).success) {
        validated.push(task as ValidatedDMDTask);
      } else if (ValidatingDMDTask.safeParse(task).success) {
        validating.push(task as ValidatingDMDTask);
      } else {
        base.push(task as DMDTask);
      }
    }

    return {
      props: { base, validated, validating, queued, complete },
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
  export let validating: ValidatingDMDTask[] = [];
  export let validated: ValidatedDMDTask[] = [];
  export let queued: QueuedDMDTask[] = [];
  export let complete: (SucceededDMDTask | FailedDMDTask)[] = [];

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
    ({ base, validated, validating, queued, complete } = results.props);
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
Validating:
<br />
{#each validating as task}
  {task.fileName}
  <br />
{/each}

<br />
<br />
Validated:
<br />
{#each validated as task}
  {task.fileName}
  <br />
{/each}

<br />
<br />
Queued:
<br />
{#each queued as task}
  {task.fileName}
  <br />
{/each}

<br />
<br />
Complete:
<br />
{#each complete as task}
  {task.fileName}
  <br />
{/each}
