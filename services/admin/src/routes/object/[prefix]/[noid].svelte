<script lang="ts">
  // if we kept AccessObject in the import above, the code fails on the client. always use `import type` with types
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { getContext } from "svelte";

  let object: AccessObject;
  const objectStore: SvelteStore<AccessObject> = getContext("objectStore");
  $: object = $objectStore;
  $: console.log(object);

  let type: "collection" | "canvasManifest" | "other";
  const typeStore: SvelteStore<"collection" | "canvasManifest" | "other"> =
    getContext("typeStore");
  $: type = $typeStore;
  $: console.log(type);
</script>

{#if object}
  {type}
  {JSON.stringify(object)}
{/if}
