<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  export let checkVal: any;

  let checkStore = writable(checkVal);
  let showDefaultStore = writable(true);

  setContext("checkStore", checkStore);
  setContext("showDefaultStore", showDefaultStore);

  function updateMethod(checkVal: any) {
    checkStore.set(checkVal);
    showDefaultStore.set(true);
  }

  $: {
    updateMethod(checkVal);
  }
</script>

<slot />
