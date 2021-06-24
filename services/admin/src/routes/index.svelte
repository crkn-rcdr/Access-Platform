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
  <div class="hero full-bleed">
    <div class="wrapper">
      <h1>Welcome to SvelteKit</h1>
      <p>
        Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
      </p>
    </div>
  </div>

  <br />
  <br />
  <Resolver slug="oocihm.8_06941" />

  <br />
  <br />
  <TypeAhead label="Edit object:" on:selected={slugSelected} />
</div>
