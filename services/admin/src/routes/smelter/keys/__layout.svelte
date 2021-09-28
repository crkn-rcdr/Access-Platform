<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      const keys = page.params["keys"]
        ? decodeURIComponent(decodeURIComponent(page.params["keys"])).split(",")
        : [];
      console.log(page.params["keys"], keys);
      if (keys && keys.length) {
        const response = await context.lapin.query(
          "dipstaging.listFromKeys",
          keys
        );
        if (response) return { props: { results: response, keys } };
        else
          return {
            props: {
              error: {
                message: "No Views found",
              },
            },
          };
      }
      return { props: {} };
    } catch (e) {
      return { props: { error: e?.message } };
    }
  };
</script>

<script lang="ts">
  /**
   * @file
   * @description This page displays the information about the dipstaging process
   */
  import DipstagingLookup from "$lib/components/dipstaging/DipstagingLookup.svelte";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import type { ImportStatus } from "@crkn-rcdr/access-data";
  import DipstagingItemStatusTable from "$lib/components/dipstaging/DipstagingItemStatusTable.svelte";
  export let keys: string[] = [];
  export let results: ImportStatus[] = [];
  export let error: string = "";

  let activeStepIndex = 0;
  $: if (keys?.length) activeStepIndex = 1;
</script>

{error}
<ScrollStepper
  bind:activeStepIndex
  displayPrevious={true}
  enableAutoScrolling={false}
>
  <ScrollStepperStep title="Look-up packages to import">
    <div slot="icon">1</div>
    <DipstagingLookup bind:keys />
  </ScrollStepperStep>
  <ScrollStepperStep title="Create manifests from packages" isLastStep={true}>
    <div slot="icon">2</div>
    <slot />
  </ScrollStepperStep>
</ScrollStepper>

<DipstagingItemStatusTable bind:results />
<!--https://access-dev.canadiana.ca/smelter/keys/test
  Dipstaging {keys} /-->
