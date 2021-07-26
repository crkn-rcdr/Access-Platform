<script lang="ts">
  import ExpansionTile from "./ExpansionTile.svelte";
  export let status: "success" | "fail" | "warn" = "success";
  export let message = "";
  export let detail = "";
  export let expandable = false;
  export let float = false;
</script>

{#if message && message.length}
  <div
    class={`notification-bar notification-bar-${status}`}
    class:notification-bar-float={float}
  >
    {#if expandable && detail && detail.length}
      <ExpansionTile>
        <div slot="top">{message}</div>
        <div slot="bottom">{detail}</div>
      </ExpansionTile>
    {:else}
      {message}
    {/if}
  </div>
{/if}

<style>
  .notification-bar {
    background-color: var(--structural-div-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1rem;
    display: block;
    width: 100%;
  }
  .notification-bar-float {
    position: fixed;
    top: 1rem;
    right: 1rem;
    min-width: 300px;
    width: fit-content;
    display: inline-block;
  }

  .notification-bar-success {
    background-color: var(--success-light);
    border: 1px solid var(--success);
    color: var(--success);
  }
  .notification-bar-warn {
    background-color: var(--warn-light);
    border: 1px solid var(--warn);
    color: var(--warn);
  }
  .notification-bar-fail {
    background-color: var(--danger-light);
    border: 1px solid var(--danger);
    color: var(--danger);
  }
  div {
    display: inline;
  }
</style>
