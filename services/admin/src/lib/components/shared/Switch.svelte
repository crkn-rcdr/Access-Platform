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
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  export let checkVal: any;

  let checkStore = writable(checkVal);
  let showDefaultStore = writable(true);

  setContext("checkStore", checkStore);
  setContext("showDefaultStore", showDefaultStore);

  function updateMethod(checkVal: any) {
    checkStore.set(checkVal);
    showDefaultStore.set(true);
  }

  $: {
    updateMethod(checkVal);
  }
</script>

<slot />
