<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      if (page.params["keys"] || page.params["dates"])
        return { props: { activeStepIndex: 1 } };
      else return { props: { activeStepIndex: 0 } };
    } catch (e) {
      return { props: { error: e?.message } };
    }
  };
</script>

<script lang="ts">
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Dipstaging from "$lib/components/dipstaging/Dipstaging.svelte";
  /**
   * @template
   * @description This is the common layout for the dmd task updater pages
   */

  import Wizard from "$lib/components/shared/Wizard.svelte";

  export let activeStepIndex: number;
  export let error: string;
</script>

<Wizard title="Smelter">
  {#if error}
    <NotificationBar status="fail" message={error} />
  {/if}
  {#if typeof activeStepIndex !== "undefined"}
    <Dipstaging bind:activeStepIndex>
      <slot />
    </Dipstaging>
  {/if}
</Wizard>
