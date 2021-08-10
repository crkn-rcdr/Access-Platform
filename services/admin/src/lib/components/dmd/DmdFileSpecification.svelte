<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import FileSelector from "../shared/FileSelector.svelte";

  export let metadataType: string | undefined = undefined;
  export let metadataFile: File | undefined = undefined;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  function handleFileselected(event: any) {
    console.log("file", event.detail);
    dispatch("fileSelected", event.detail);
    metadataFile = event.detail;
  }
</script>

<div>
  <!--fieldset>
    <legend>Metadata File Information</legend-->
  <div>
    <label for="metadata-type">Metadata Type:</label>
    <select name="metadata-type" bind:value={metadataType}>
      <option value="" />
      <option value="issueinfocsv">Issueinfo CSV</option>
      <option value="dccsv">Dublin Core CSV</option>
      <option value="marc490">MARC - ID in 490</option>
      <option value="marcoocihm">MARC - ID in oocihm interpretation</option>
      <option value="marcooe">MARC - ID in ooe interpretation</option>
    </select>
  </div>
  <br />
  <span>Metadata File:</span>
  <FileSelector on:change={handleFileselected} />
  <!--/fieldset-->
</div>

<style>
  select {
    width: 100%;
  }
</style>
