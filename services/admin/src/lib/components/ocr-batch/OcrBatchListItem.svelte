<script lang="ts">
  import type { OcrBatch } from "@crkn-rcdr/access-data";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";

  export let batch: OcrBatch;
  export let stage: "export" | "import" | "N/A";
  export let status: "failed" | "waiting" | "succeeded" | "N/A";
  export let message: string = "";
</script>

{#if batch}
  <div class="item-wrap auto-grid">
    <span class="auto-align auto-align__a-center">
      {batch.name}
    </span>
    <span class="auto-align auto-align__a-center">
      {stage}
      {#if status !== "N/A"}
        {status}{#if message?.length}: {message}{/if}
      {/if}
    </span>
    <span class="auto-align auto-align__a-center">
      {batch.canvases?.length} Canvases
    </span>

    <span class="actions auto-align auto-align__a-center auto-align__j-end">
      {#if status === "waiting"}
        <button class="action secondary"> Cancel </button>
      {:else if status === "failed"}
        <button class="action secondary"> Retry </button>
      {:else if status === "succeeded" && stage === "export"}
        <button class="action save"> Import </button>
      {/if}

      <div class="action icon">
        <TiTrash />
      </div>
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
  .action {
    margin-left: 1rem;
  }
  .action.icon {
    opacity: 0.6;
    cursor: pointer;
  }
  button {
    min-width: 10rem;
  }
</style>
