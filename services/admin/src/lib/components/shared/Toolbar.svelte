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
  export let title = "";
</script>

<div class="toolbar">
  <div class="auto-align auto-align__full auto-align auto-align__a-center">
    <h5>{title}</h5>
    <div class="toolbar-content">
      <slot />
    </div>
  </div>
</div>

<style>
  .toolbar {
    background-color: var(--structural-div-bg);
    padding: 0.75rem 2rem;
    width: 100%;
    height: 100%;
  }
  h5 {
    margin: 0 !important;
    display: inline;
    flex: 9;
  }
  .toolbar-content {
    flex: 3;
    text-align: right;
  }
</style>
