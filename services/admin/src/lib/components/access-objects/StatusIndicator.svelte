<!--
@component
### Overview
This component displays the publish status of an access object

### Properties
|    |    |    |
| -- | -- | -- |
| object: AccessObject  | required | The object to display the status of. |

### Usage
```  
<StatusIndicator bind:object />
```
*Note: `bind:` is required for changes to the object and its model to be reflected in higher level components.*
-->
<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";

  /**
   * @type {string} The object to display the status of.
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
