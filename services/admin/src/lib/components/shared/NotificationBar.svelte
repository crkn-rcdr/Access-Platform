<script lang="ts">
  import ExpansionTile from "./ExpansionTile.svelte";
  export let status: "success" | "fail" | "warn" = "success";
  export let message = "";
  export let detail = "";
</script>

<div class={`notification-bar notification-bar-${status}`}>
  <ExpansionTile>
    <div slot="top">{message}</div>
    <div slot="bottom">{detail}</div>
  </ExpansionTile>
</div>

<style>
  .notification-bar {
    background-color: var(--structural-div-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    position: fixed;
    top: 1rem;
    right: 1rem;
    min-width: 300px;
    padding: 1rem;
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
