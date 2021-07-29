<script lang="ts">
  import ExpansionTile from "./ExpansionTile.svelte";
  export let status: "success" | "fail" | "warn" = "success";
  export let message = "";
  export let detail = "";
  export let expandable = false;
  export let float = false;
  export let dissmissFunction = null;
  export let notificationPosition = 1;

  const notificationHeightRem = 5;
  const notificationSpacing = 1;
</script>

{#if message && message.length}
  <div
    class={`notification-bar notification-bar-${status}`}
    class:notification-bar-float={float}
    style={float
      ? `bottom: ${
          notificationPosition * notificationHeightRem + notificationSpacing
        }rem;`
      : ""}
  >
    {#if expandable && detail && detail.length}
      <ExpansionTile useInfoIcon={true}>
        <div slot="top">
          {message}
          {#if dissmissFunction}
            <button class="dismiss sm ghost dark" on:click={dissmissFunction}
              >dismiss</button
            >
          {/if}
        </div>
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
    right: 1rem;
    min-width: 20rem;
    max-width: 36rem;
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

  .dismiss {
    float: right;
  }
</style>
