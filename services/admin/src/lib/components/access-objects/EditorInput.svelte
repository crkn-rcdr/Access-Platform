<script lang="ts">
  import ValueSaveForm from "$lib/components/shared/ValueSaveForm.svelte";
  import { createEventDispatcher } from "svelte";

  export let keys: string[];
  export let value: any;
  export let saveDisabled: boolean = false;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Sends the request to save changes to the backend using lapin. Uses @function showConfirmation to display a floating notification with the results of the lapin call. The result of the lapin call is returned.
   * @param data
   * @returns response
   */
  async function handleSavePressed() {
    let data = {};
    keys.reduce((prevVal, currKey, currIndex) => {
      if (currIndex === keys.length - 1) {
        return prevVal[currKey] || (prevVal[currKey] = value);
      } else {
        return prevVal[currKey] || (prevVal[currKey] = {});
      }
    }, data);
    dispatch("save", data);
  }
</script>

<ValueSaveForm bind:value bind:saveDisabled on:save={handleSavePressed}>
  <slot />
</ValueSaveForm>
