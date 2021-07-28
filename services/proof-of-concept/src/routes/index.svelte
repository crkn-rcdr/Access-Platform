<!--script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import type { RootInput } from "./__layout.svelte";
  export const load: Load<RootInput> = async ({ context }) => {
    try {
      return {
        props: {
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
  import { getLapin } from "$lib/lapin";

  export let servertest = "server!";
  let test = "waiting";
  let failure = "should fail";

  onMount(async () => {
    const lapin = getLapin();
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
<p>{failure}</p-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";

  function slugSelected(event: CustomEvent<string>) {
    const noid = event.detail;
    goto(`/object/${noid}`);
  }
</script>

<div class="wrapper">
  <div class="hero hero__gradient full-bleed">
    <div class="wrapper">
      <h1>Admin Tools</h1>
    </div>
  </div>

  <br />
  <br />
  <Resolver slug="" noid="" />

  <br />
  <br />
  <a href="/object"><button class="primary">Create New Object</button></a>

  <br />
  <br />
  <TypeAhead label="Search for an object to edit:" on:selected={slugSelected} />
</div>
