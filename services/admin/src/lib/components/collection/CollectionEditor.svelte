<script lang="ts">
  import { onMount } from "svelte";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isCollection } from "@crkn-rcdr/access-data";
  /* import Switch from "$lib/components/shared//Switch.svelte";
  import SwitchCase from "$lib/components/shared//SwitchCase.svelte"; */

  export let model: AccessObject;
</script>

<div class="editor">
  {#if isCollection(model)}
    <label for="Type">Type</label><br />
    <input type="text" id="type" name="type" bind:value={model["type"]} /><br />
  {/if}
  {#if isCollection(model)}
    <label for="public">Public</label><br />
    <input
      type="text"
      id="public"
      name="public"
      bind:value={model["public"]}
    /><br />
  {/if}
</div>

<style>
  .editor {
    width: 100%;
  }
</style>
