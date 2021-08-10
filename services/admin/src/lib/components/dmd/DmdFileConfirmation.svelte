<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let metadataFile: File = undefined;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  function handleProcess(event: any) {
    dispatch("process", event);
  }
</script>

{#if metadataFile}
  <b>Metadata File Information</b>
  <table>
    <tr>
      <td><b>Name</b></td>
      <td>{metadataFile["name"]}</td>
    </tr>
    <tr>
      <td><b>Content Type</b></td>
      <td>{metadataFile["type"]}</td>
    </tr>
    <tr>
      <td><b>Length</b></td>
      <td>{metadataFile["size"]}</td>
    </tr>
  </table>
  <br />
  <button class="button primary" type="submit" on:click={handleProcess}>
    Process File
  </button>
{/if}

<style>
  textarea {
    width: 100%;
  }
</style>
