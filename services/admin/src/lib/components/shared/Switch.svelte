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
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  /**
   * @type {string} Slug being resolved.
   */
  export let checkVal: any;

  /**
   * @type {string} Slug being resolved.
   */
  let checkStore = writable(checkVal);

  /**
   * @type {string} Slug being resolved.
   */
  let showDefaultStore = writable(true);

  /**
   *
   */
  setContext("checkStore", checkStore);
  setContext("showDefaultStore", showDefaultStore);

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function updateMethod(checkVal: any) {
    checkStore.set(checkVal);
    showDefaultStore.set(true);
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  $: {
    updateMethod(checkVal);
  }
</script>

<slot />
