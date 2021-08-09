<script lang="ts">
  import DmdPrefixSelector from "$lib/components/dmd/DmdPrefixSelector.svelte";
  import { createEventDispatcher } from "svelte";
  import FileSelector from "../shared/FileSelector.svelte";

  export let depositorPrefix: string = undefined;
  export let metadataType = undefined;
  export let metadataFile: File = undefined;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  function handleFileselected(event: any) {
    dispatch("fileSelected", event);
    metadataFile = event;
  }
</script>

<div>
  <DmdPrefixSelector bind:prefix={depositorPrefix} />
  <br />
  <br />
  <fieldset>
    <legend>Metadata file information</legend>
    <div>
      Select type:
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
    <FileSelector on:change={handleFileselected} />
  </fieldset>
</div>

<style>
  select {
    width: 100%;
  }
</style>
