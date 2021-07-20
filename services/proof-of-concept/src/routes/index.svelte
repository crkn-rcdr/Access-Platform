<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import type { RootInput } from "./__layout.svelte";

  export const load: Load<RootInput> = async ({ context }) => {
    let serverfailure;

    try {
      serverfailure = await context.lapin.query("slug.search", "??");
    } catch (e) {
      serverfailure = e;
    }

    return {
      props: {
        lapin: context.lapin,
        servertest: await context.lapin.query("slug.search", "oo"),
        serverfailure,
      },
    };
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";

  export let lapin;
  export let servertest;
  export let serverfailure;
  let test = "waiting";
  let failure = "should fail";

  onMount(async () => {
    test = (await lapin.query("slug.search", "oo")).toString();

    try {
      failure = (await lapin.query("slug.search", "??")).toString();
    } catch (e) {
      failure += ": " + e;
    }
  });
</script>

<h1>Proof of concept!</h1>

<p>{servertest}</p>
<p>{serverfailure}</p>
<p>{test}</p>
<p>{failure}</p>
