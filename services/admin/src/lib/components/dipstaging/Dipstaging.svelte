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
  import DipstagingTable from "$lib/components/dipstaging/DipstagingTable.svelte";
  import DipstagingLookup from "$lib/components/dipstaging/DipstagingLookup.svelte";
  import ResolveMany from "../access-objects/ResolveMany.svelte";
  import PrefixSelector from "../collections/PrefixSelector.svelte";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";

  export let activeStepIndex: number = 0;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  let prefix = "";
  /*export let keys: string[];
  const { session } = getStores<Session>();
  async function showDipstagingRecords() {
      let slugs = input.split(/[,|\s]/);
    if (prefix.length > 0) {
      slugs = slugs.map((slug) => prefix + slug);
    } 
    const response = await $session.lapin.query(
      "dipstaging.listFromKeys",
      keys
    );
  }*/
</script>

<!--div>
  <PrefixSelector bind:prefix />
</div-->

<ScrollStepper
  bind:activeStepIndex
  displayPrevious={true}
  enableAutoScrolling={false}
>
  <ScrollStepperStep title="Select a prefix and look-up items">
    <div slot="icon">1</div>
    <DipstagingLookup />
  </ScrollStepperStep>
  <ScrollStepperStep
    title={`Update descriptive metadata for items found`}
    isLastStep={true}
  >
    <div slot="icon">2</div>
    <slot />
  </ScrollStepperStep>
</ScrollStepper>
