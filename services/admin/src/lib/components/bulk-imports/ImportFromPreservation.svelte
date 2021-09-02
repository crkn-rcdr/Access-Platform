<!--
@component
### Overview
The resolver component allows the user to enter a slug, and then a request is sent to the backend to vheck if an object exists with that slug. Error states are shown for invalid slugs or otherwise.

### Properties
|    |    |    |
| -- | -- | -- |
| slug : string                      | optional | Slug being resolved. |
| noid: string | null | undefined    | optional | Noid that the slug resolves to, or null. |
| hideInitial : boolean              | optional | Whether to hide the display when the current slug is the same as the initial slug provided. |

### Usage
```  
  <Resolver
    bind:slug={object["slug"]}
    noid={object["id"]}
    on:available={(event) => {
      ..do something
    }}
  />
```
*Note: `bind:` is required for changes to the properties to be reflected in higher level components.*
-->
<script lang="ts">
  import ResolveMany from "../access-objects/ResolveMany.svelte";
  import PrefixSelector from "../collections/PrefixSelector.svelte";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

 
</script>
