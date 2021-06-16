<script lang="ts">
  import { getContext } from "svelte";
  export let caseVal: any;
  let checkStore: SvelteStore<any> = getContext("checkStore");
  /*checkStore.subscribe((val: any) => {});*/
</script>

{#if $checkStore === caseVal}
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
