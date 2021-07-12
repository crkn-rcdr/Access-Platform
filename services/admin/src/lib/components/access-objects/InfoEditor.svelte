<script lang="ts">
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import type { AccessObject } from "@crkn-rcdr/access-data";

  export let object: AccessObject; // Not sure if we should pass an object or have a list of props (ex: slug, label, ...) that can be null, and show ones that are instantiated only?
</script>

{#if object}
  <form>
    <!--TODO: replace with slug resolver component-->
    {#if isManifest(object) || isCollection(object)}
      <label for="slug">Slug</label><br />
      <input type="text" id="slug" name="slug" bind:value={object["slug"]} /><br
      /><br />
    {/if}

    {#if isManifest(object)}
      <label for="label">Label</label><br />
      <textarea
        id="label"
        name="label"
        bind:value={object["label"]["none"]}
      /><br /><br />

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
  </form>
{/if}

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
