<script lang="ts">
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import { createEventDispatcher } from "svelte";

  export let dmdTask: DMDTask = undefined;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  function handleConfirm(event: any) {
    dispatch("confirm", event);
  }
</script>

{#if dmdTask?.["attachments"]?.["metadata"]}
  <table>
    <tr>
      <td><b>Name</b></td>
      <td>Metadata</td>
    </tr>
    <tr>
      <td><b>Length</b></td>
      <td>{dmdTask["attachments"]["metadata"].length}</td>
    </tr>
    <tr>
      <td><b>Content Type</b></td>
      <td>{dmdTask["attachments"]["metadata"].content_type}</td>
    </tr>
  </table>
  <br />
  <button class="button primary" type="submit" on:click={handleConfirm}>
    Confirm Load
  </button>
{/if}
