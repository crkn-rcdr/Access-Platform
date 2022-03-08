<script lang="ts">
  import TiWarning from "svelte-icons/ti/TiWarning.svelte";
  import TiDelete from "svelte-icons/ti/TiDelete.svelte";
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
  export let status: "waiting" | "failed" | "succeeded" | "warning" | "N/A";
</script>

<div class="item-wrap auto-grid">
  <span class="auto-align auto-align__a-center">
    <slot name="title" />
  </span>
  {#if status}
    <span class="auto-align auto-align__a-center">
      {#if status === "warning"}
        <span data-tooltip="See message below" class="icon warning">
          <TiWarning />
        </span>
      {:else if status === "succeeded"}
        <span class="icon success">
          <FaCheckCircle />
        </span>
      {:else if status === "failed"}
        <span data-tooltip="See message below" class="icon not-success">
          <TiDelete />
        </span>
      {/if}
      <span>
        <slot name="stage" />
        {status}
        {#if status === "waiting"}...{/if}
      </span>
    </span>
  {/if}

  <span class="auto-align auto-align__a-center">
    <slot name="date" />
  </span>

  <span class="auto-align auto-align__a-center">
    <slot name="details" />
  </span>

  <span class="actions auto-align auto-align__a-center auto-align__j-end">
    <slot name="actions" />
  </span>
</div>

<style>
  .item-wrap {
    width: 100%;
    grid-template-columns: 2fr 1fr 1fr 1fr 2fr;
    background: var(--structural-div-bg);
    padding: 1rem;
  }
  .actions {
    text-align: right;
  }
  :global(.action) {
    margin-left: 1rem;
  }
  :global(.action.icon) {
    opacity: 0.6;
    cursor: pointer;
  }
  :global(button) {
    min-width: 10rem;
  }
  .success.icon {
    color: var(--success);
    background-color: transparent;
    /*For FA size*/
    width: 1.4rem;
    height: 1.4rem;
    margin-left: 0.3rem;
    margin-right: 0.4rem;
  }
  .not-success.icon {
    color: var(--danger);
    cursor: pointer;
    background-color: transparent;
  }
  .warning.icon {
    color: var(--warn);
    background-color: transparent;
    width: 1.7rem;
    height: 1.7rem;
    margin-left: 0.2rem;
    margin-right: 0.3rem;
    cursor: pointer;
  }

  span {
    word-break: break-all;
  }
</style>
