<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import { showConfirmation } from "$lib/utils/confirmation";

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
    await showConfirmation(
      async () => {
        try {
          await $session.lapin.mutation("dmdTask.setItemShouldUpdate", {
            id: taskId,
            index,
            value: checked,
          });
          // dispatch --- parent check all selected
          dispatch("changed", { index, checked });

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
      "Error: failed to save selection.",
      true
    );
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
