<script lang="ts">
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  export let manifest: CanvasManifest;
</script>

<span class="status">
  <span>Status: </span>
  <span>{manifest["public"] ? "published" : "unpublished"}</span>
</span>

<style>
  .status {
    margin-bottom: 4px;
    color: var(--grey);
  }
  .status span {
    font-size: 16px !important;
  }
</style>
