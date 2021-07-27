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
  /**
   * @type {string} Slug being resolved.
   */
  export let display = "inline-flex";

  /**
   * @type {string} Slug being resolved.
   */
  export let horizontal = "flex-start";

  /**
   * @type {string} Slug being resolved.
   */
  export let vertical = "flex-start";

  /**
   * @type {string} Slug being resolved.
   */
  export let direction = "row";
</script>

<div
  class="align"
  style="
        display: {display};
        justify-content: {horizontal}; 
        align-items: {vertical};
        flex-direction: {direction};"
>
  <slot />
</div>

<style>
  .align {
    width: 100%;
    height: 100%;
  }
</style>
