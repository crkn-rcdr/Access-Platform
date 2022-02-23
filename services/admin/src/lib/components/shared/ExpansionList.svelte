<script lang="ts">
  import ExpansionTile from "$lib/components/shared/ExpansionTile.svelte";

  export let showMessage = false;
  export let message = "";
</script>

<ExpansionTile toggled={true} topClass="toggle-title">
  <span slot="top">
    <slot name="title" />
  </span>
  <div class="toggle-list" slot="bottom">
    {#if showMessage}
      <div class="default">{message}</div>
    {:else}
      <slot />
    {/if}
  </div>
</ExpansionTile>

<style>
  :global(.toggle-title) {
    background: var(--structural-div-bg);
    padding: 1rem;
    /*font-size: var(--perfect-fourth-6);*/
    background: var(--backdrop-bg);
    margin-top: 1rem;
  }
  .default {
    width: 100%;
    background: var(--base-bg);
    background: var(--structural-div-bg);
    padding: 1rem;
    display: grid;
    grid-gap: 1rem;
  }
</style>
