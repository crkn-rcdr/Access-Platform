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
<script>
  /**
   * @type {string} Slug being resolved.
   */
  export let overflowX = "auto";

  /**
   * @type {string} Slug being resolved.
   */
  export let overflowY = "auto";
</script>

<div
  class="side-menu-page"
  style="
      overflow-x: {overflowX};
      overflow-y: {overflowY};"
>
  <slot />
</div>

<style>
  .side-menu-page {
    height: 100%;
    width: 100%;
  }
</style>
