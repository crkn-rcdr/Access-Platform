<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  export let caseVal: any;
  let checkStore: SvelteStore<any> = getContext("checkStore");
  let showDefaultStore: Writable<boolean> = getContext("showDefaultStore");
  let switchOn = false;
  $: {
    switchOn = $checkStore === caseVal;
    $showDefaultStore = $showDefaultStore && !switchOn;
  }
</script>

{#if switchOn}
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
