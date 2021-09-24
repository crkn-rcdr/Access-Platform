<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      console.log(page.path);
      if (page.path === "/smelter")
        return { props: { activePageIndex: 0, activeStepIndex: 0 } };
      else if (page.path.includes("browse"))
        return { props: { activePageIndex: 0, activeStepIndex: 1 } };
      else if (page.path.includes("keys"))
        return { props: { activePageIndex: 1, activeStepIndex: 1 } };
      else if (page.path.includes("dates"))
        return { props: { activePageIndex: 1, activeStepIndex: 1 } };
      else if (page.path.includes("queue"))
        return { props: { activePageIndex: 2, activeStepIndex: 1 } };
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

  export let activePageIndex: number;
  export let activeStepIndex: number;
  export let error: string;
</script>

<Wizard title="Smelter" size="lg">
  {#if error}
    <NotificationBar status="fail" message={error} />
  {/if}
  {#if typeof activePageIndex !== "undefined" && typeof activeStepIndex !== "undefined"}
    <Dipstaging bind:activePageIndex bind:activeStepIndex>
      <slot />
    </Dipstaging>
  {/if}
</Wizard>
