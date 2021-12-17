<!--
@component
### Overview
This component displays the publish status of an access serverObject

### Properties
|    |    |    |
| -- | -- | -- |
| serverObject: AccessObject  | required | The serverObject to display the status of. |

### Usage
```  
<StatusIndicator bind:serverObject />
```
*Note: `bind:` is required for changes to the serverObject and its model to be reflected in higher level components.*
-->
<script lang="ts">
  import type { PagedAccessObject } from "@crkn-rcdr/access-data";

  /**
   * @type {string} The serverObject to display the status of.
   */
  export let serverObject: PagedAccessObject;
</script>

{#if serverObject["id"]}
  <span class="status">
    <span>Status:</span>
    <span>
      {serverObject["public"]
        ? `published on ${
            typeof serverObject["public"] === "string"
              ? serverObject["public"]
              : new Date(
                  parseInt(`${serverObject["public"]}`) * 1000
                ).toLocaleString()
          }`
        : "unpublished"}
    </span>
  </span>
{/if}

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
