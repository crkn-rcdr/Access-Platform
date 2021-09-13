<!--
@component
### Overview
This component shows a CRKN-esque loader to be used when an action is being performed.
### Properties
|    |    |    |
| -- | -- | -- |
| href: string   | required | The link to prefetch. |
### Usage
```  
<PrefetchLoader {bind:href}>
  ..content to be loaded
</PrefetchLoader>
```
-->
<script lang="ts">
  import { goto, prefetch } from "$app/navigation";
  import { createEventDispatcher } from "svelte";
  import Loading from "$lib/components/shared/Loading.svelte";

  /**
   * @type { string } The link to prefetch.
   */
  export let href: string;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  let prefetching = false;

  async function doPrefetch() {
    prefetching = true;
    await prefetch(href);
    dispatch("prefetched", href);
    goto(href);
    prefetching = false;
  }

  $: {
    if (href?.length) doPrefetch();
  }
</script>

<div class="wrapper center">
  {#if !prefetching}
    <slot />
  {:else}
    <Loading backgroundType="gradient" /><br />
    Loading...
  {/if}
</div>

<style>
</style>
