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
