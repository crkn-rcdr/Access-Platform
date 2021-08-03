<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";

  export const load: Load<RootLoadOutput> = async ({ context }) => {
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
  import { goto } from "$app/navigation";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";

  import { onMount } from "svelte";
  import type { RootLoadOutput } from "$lib/types";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import DropdownMenu from "$lib/components/shared/DropdownMenu.svelte";

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

  function slugSelected(event: CustomEvent<string>) {
    const noid = event.detail;
    goto(`/object/${noid}`);
  }
</script>

<div class="wrapper">
  <!--div class="hero hero__gradient full-bleed">
    <div class="wrapper">
      <h1>Admin Tools</h1>
    </div>
  </div>

  <p>{servertest}</p>
  <p>{serverfailure}</p>
  <p>{test}</p>
  <p>{failure}</p>

  <br />
  <br />
  <label for="slug">Slug:</label>
  <br />
  <Resolver slug="" noid="" /-->

  <NotificationBar message="New fix pushed!" status="success" />
  <NotificationBar message="There is some error!" status="fail" />
  <NotificationBar
    message="The platform is experiencing an outage."
    status="warn"
  />
  <br />
  <TypeAhead
    placeholder="Search for a canvas or manifest..."
    on:selected={slugSelected}
  />
</div>
