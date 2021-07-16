<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  export let object: AccessObject;
</script>

<span class="status">
  <span>Status:</span>
  <span
    >{object["public"]
      ? `published on ${object["public"]}`
      : "unpublished"}</span
  >
</span>

<style>
  .status {
    margin-bottom: 0.25rem;
    color: var(--base-font);
    opacity: 0.5;
  }
  .status span {
    font-size: var(--perfect-fourth-8);
  }
</style>
