<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  export let object: AccessObject;
</script>

<span class="status">
  <span>Status: </span>
  <span>{object["public"] ? "published" : "unpublished"}</span>
</span>

<style>
  .status {
    margin-bottom: 4px;
    color: var(--grey);
  }
  .status span {
    font-size: var(--smaller-font-size) !important;
  }
</style>
