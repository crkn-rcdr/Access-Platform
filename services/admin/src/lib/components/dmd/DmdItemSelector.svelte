<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";

  export let taskId: string;
  export let checked: boolean;
  export let disabled: boolean;
  export let index: number;
  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();
  /**

   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  async function handleChange() {
    // send val to backend
    try {
      await $session.lapin.mutation("dmdTask.setItemShouldUpdate", {
        id: taskId,
        index,
        value: checked,
      });
      // dispatch --- parent check all selected
      dispatch("changed", { index, checked });
    } catch (e: any) {
      console.log(e.message);
    }
  }
</script>

<input
  type="checkbox"
  bind:checked
  on:change={handleChange}
  class:not-usable={disabled}
/>

<style>
  .not-usable {
    cursor: not-allowed !important;
    pointer-events: none;
  }
</style>
