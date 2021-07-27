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
  import type { AccessObject } from "@crkn-rcdr/access-data";

  /**
   * @type {string} Slug being resolved.
   */
  export let object: AccessObject;
</script>

<span class="status">
  <span>Status:</span>
  <span
    >{object["public"]
      ? `published on ${object["public"]}`
      : "unpublished"}</span
  >
</span>

<style>
  .status {
    margin-bottom: 0.25rem;
    color: var(--base-font);
    opacity: 0.5;
  }
  .status span {
    font-size: var(--perfect-fourth-8);
  }
</style>
