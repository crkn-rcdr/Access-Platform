<script lang="ts">
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";

  export let manifest: CanvasManifest;
</script>

<form>
  <!--TODO: replace with slug editor
      b: ["unordered", "individuals", "continuous", "paged"]
  
      v: [
        "left-to-right",
        "right-to-left",
        "top-to-bottom",
        "bottom-to-top"
      ]
      -->
  <label for="slug">Slug</label><br />
  <input type="text" id="slug" name="slug" /><br /><br />

  <label for="label">Label</label><br />
  <textarea id="label" name="label" /><br /><br />

  <span>
    <label for="behaviour">Behaviour</label>
    <select id="behaviour" name="behaviour">
      <option>One</option>
    </select>
  </span>

  <span>
    <label for="viewing-direction">Viewing Direction</label>
    <select id="viewing-direction" name="viewing-direction">
      <option>One</option>
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
