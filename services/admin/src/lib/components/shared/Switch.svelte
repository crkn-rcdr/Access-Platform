<script lang="ts">
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  export let checkVal: any;

  let checkStore = writable(checkVal);

  setContext("checkStore", checkStore);

  function updateMethod(checkVal: any) {
    checkStore.set(checkVal);
  }

  $: {
    updateMethod(checkVal);
  }
</script>

<slot />
