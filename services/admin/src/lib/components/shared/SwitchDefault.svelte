<script lang="ts">
  import { getContext } from "svelte";
  let showDefaultStore: SvelteStore<boolean> = getContext("showDefaultStore");
  let showDefaultView = false;
  showDefaultStore.subscribe((showDefault: boolean) => {
    showDefaultView = showDefault;
  });
</script>

{#if showDefaultView}
  <div class="switch-viewer">
    <slot />
  </div>
{/if}

<style>
  .switch-viewer {
    height: 100%;
    width: 100%;
  }
</style>
