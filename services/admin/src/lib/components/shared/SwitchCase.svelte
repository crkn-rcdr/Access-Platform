<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] | desc |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  /**
   * @type {string} Slug being resolved.
   */
  export let caseVal: any;

  /**
   * @type {string} Slug being resolved.
   */
  let checkStore: SvelteStore<any> = getContext("checkStore");

  /**
   * @type {string} Slug being resolved.
   */
  let showDefaultStore: Writable<boolean> = getContext("showDefaultStore");

  /**
   * @type {string} Slug being resolved.
   */
  let switchOn = false;

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
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
