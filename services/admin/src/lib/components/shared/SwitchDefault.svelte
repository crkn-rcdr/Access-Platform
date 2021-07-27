<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*

**Example two**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import { getContext } from "svelte";

  /**
   * @type {string} Slug being resolved.
   */
  let showDefaultStore: SvelteStore<boolean> = getContext("showDefaultStore");

  /**
   * @type {string} Slug being resolved.
   */
  let showDefaultView = false;

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
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
