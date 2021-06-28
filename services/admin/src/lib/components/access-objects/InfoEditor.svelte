<script lang="ts">
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import CollectionEditor from "$lib/components/collection/CollectionEditor.svelte";

  export let model: AccessObject;
</script>

<form>
  <!--TODO: replace with slug resolver component-->
  {#if isManifest(model) || isCollection(model)}
    <label for="slug">Slug</label><br />
    <input type="text" id="slug" name="slug" bind:value={model["slug"]} /><br
    /><br />
  {/if}

  {#if isManifest(model) || isCollection(model)}
    <label for="label">Label</label><br />
    <textarea id="label" name="label" bind:value={model["label"]["none"]} /><br
    /><br />

    <!--Fixtures don't have this yet, causes save to be enabled on load-->

    <!--span>
    <label for="behavior">Behavior</label>
    <select id="behavior" name="behavior" bind:value={manifest["behavior"]}>
      <option>continuous</option>
      <option>individuals</option>
      <option>paged</option>
      <option>unordered</option>
    </select>
  </span>

  <span>
    <label for="viewing-direction">Viewing Direction</label>
    <select
      id="viewing-direction"
      name="viewing-direction"
      bind:value={manifest["viewingDirection"]}
    >
      <option>left-to-right</option>
      <option>right-to-left</option>
      <option>top-to-bottom</option>
      <option>bottom-to-top</option>
    </select>
  </span><br /-->
  {/if}
  <CollectionEditor bind:model />
</form>

<style>
  form {
    padding: 1.5rem;
  }
  label,
  input,
  textarea {
    width: 100%;
  }
</style>
