<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
-->
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
  <div class="hero hero__gradient full-bleed">
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
  <Resolver slug="" noid="" />

  <br />
  <br />
  <a href="/object/new"><button class="primary">Create New Object</button></a>

  <br />
  <br />
  <TypeAhead label="Search for an object to edit:" on:selected={slugSelected} />
</div>
