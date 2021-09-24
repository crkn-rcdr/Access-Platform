<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  import ToggleButtons from "$lib/components/shared/ToggleButtons.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      if (page.path.includes("dip")) return { props: { view: "dip" } };
      else if (page.path.includes("neversmelted"))
        return { props: { view: "neversmelted" } };
      else if (page.path.includes("status"))
        return { props: { view: "status" } };
      else return { props: { error: "Invalid path" } };
    } catch (e) {
      return { props: { error: e?.message } };
    }
  };
</script>

<script lang="ts">
  /**
   * @template
   * @description This is the common layout for the dmd task updater pages
   */

  export let view: "neversmelted" | "dip" | "status";
  export let error: string;

  const VIEW_LABELS = [
    "Browse Packages Never Smelted",
    "Browse Newly Created Dips",
    "Browse Processed Packages",
  ];
  let activeIndex = 0;

  function setActiveIndex() {
    if (view) {
      if (view === "neversmelted") activeIndex = 0;
      else if (view === "status") activeIndex = 1;
      else if (view === "dip") activeIndex = 2;
    }
  }

  function handleChangeView() {
    if (activeIndex === 0) goto("/smelter/browse/neversmelted");
    else if (activeIndex === 1) goto("/smelter/browse/status");
    else if (activeIndex === 2) goto("/smelter/browse/dip");
  }

  onMount(() => {
    setActiveIndex();
  });
</script>

<br />
<ToggleButtons
  bind:activeIndex
  options={VIEW_LABELS}
  on:select={handleChangeView}
/><br />
<br />

<slot />
