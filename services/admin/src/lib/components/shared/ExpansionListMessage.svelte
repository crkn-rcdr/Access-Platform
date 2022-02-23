<script lang="ts">
  import XmlViewer from "$lib/components/shared/XmlViewer.svelte";

  export let status: "waiting" | "failed" | "succeeded" | "warning" | "N/A";
  export let message = "";
</script>

{#if message?.length}
  <div class="status-wrap">
    <div class={`status-message ${status}`}>
      <XmlViewer xml={message} />
    </div>
  </div>
{/if}

<style>
  .status-message {
    padding: 1rem;
  }
  .status-message.succeeded {
    background-color: var(--warn-light);
    color: var(--warn);
  }
  .status-message.failed {
    background-color: var(--danger-light);
    color: var(--danger);
  }
</style>
