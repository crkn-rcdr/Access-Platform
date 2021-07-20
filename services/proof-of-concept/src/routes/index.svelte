<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import type { RootInput } from "./__layout.svelte";

  export const load: Load<RootInput> = async ({ context }) => {
    try {
      return {
        props: {
          lapin: context.lapin,
          servertest: await context.lapin.query("slug.search", "oo"),
        },
      };
    } catch (e) {
      return { status: 504, error: e.message };
    }
  };
</script>

<script lang="ts">
  import { onMount } from "svelte";

  export let lapin;
  export let servertest = "server!";
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
<p>{test}</p>
<p>{failure}</p>
