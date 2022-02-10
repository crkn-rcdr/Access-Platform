<script lang="ts">
  import type { OcrBatch } from "@crkn-rcdr/access-data";

  export let batch: OcrBatch;
  export let stage: "export" | "import" | "N/A";
  export let status: "failed" | "waiting" | "succeeded" | "N/A";
  export let message: string = "";
</script>

{#if batch}
  <div class="item-wrap auto-grid">
    <span>
      {batch.name}
    </span>
    <span>
      {stage}
      {#if status !== "N/A"}
        {status}{#if message?.length}: {message}{/if}
      {/if}
    </span>
    <span>
      {batch.canvases?.length} Canvases
    </span>

    <span class="actions">
      {#if status === "waiting"}
        cancel
      {:else if status === "failed"}
        retry
      {:else if status === "succeeded" && stage === "export"}
        import
      {/if}
      delete
    </span>
  </div>
{/if}

<style>
  .item-wrap {
    width: 100%;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    background: var(--structural-div-bg);
    padding: 1rem;
  }
  .actions {
    text-align: right;
  }
</style>
