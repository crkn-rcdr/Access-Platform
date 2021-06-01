<script lang="ts">
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";

  export let manifest: CanvasManifest;
</script>

<form>
  <label for="slug">Slug</label><br />
  <input type="text" id="slug" name="slug" bind:value={manifest["slug"]} /><br
  /><br />

  <label for="label">Label</label><br />
  <textarea
    id="label"
    name="label"
    bind:value={manifest["label"]["value"]}
  /><br /><br />
  <span>
    <label for="behavior">Behavior</label>
    <select id="behavior" name="behavior" bind:value={manifest["behavior"]}>
      <option>unordered</option>
      <option>individuals</option>
      <option>continuous</option>
      <option>paged</option>
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
  </span>
</form>

<style>
  form {
    padding: 24px;
  }
  label,
  input,
  textarea {
    width: 100%;
  }
  span {
    margin-right: 24px;
  }
</style>
