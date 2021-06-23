<script lang="ts">
  import { page } from "$app/stores";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { getContext } from "svelte";

  let object: AccessObject;
  const objectStore: SvelteStore<AccessObject> = getContext("objectStore");
  object = $objectStore;
</script>

<slot />

{#if object}
  <div class="wrapper">
    <a href={`/object/${$page.params["prefix"]}/edit/${$page.params["noid"]}`}
      >Edit</a
    >
    <br /><br />
    <p>{JSON.stringify(object)}</p>
  </div>
{/if}
