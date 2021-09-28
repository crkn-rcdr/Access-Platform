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
  let error: string = "";
  let results: ImportStatus[] = [];

  let activeStepIndex = 0;
  $: {
    if (results?.length) activeStepIndex = 1;
    else activeStepIndex = 0;
  }
</script>

{error}
<!--ScrollStepper
  bind:activeStepIndex
  displayPrevious={true}
  enableAutoScrolling={false}
>
  <ScrollStepperStep title="Look-up packages to import">
    <div slot="icon">1</div-->
<DipstagingLookup bind:results />
<!--/ScrollStepperStep>
  <ScrollStepperStep title="Create manifests from packages" isLastStep={true}>
    <div slot="icon">2</div-->
<!--https://access-dev.canadiana.ca/smelter/keys/test
      Dipstaging {keys} /-->
<DipstagingItemStatusTable bind:results />
<!--/ScrollStepperStep>
</ScrollStepper-->
