<script lang="ts">
  import { goto } from "$app/navigation";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";
  import TypeAhead from "$lib/components/shared/TypeAhead.svelte";

  function slugSelected(event: CustomEvent<string>) {
    const noid = event.detail;
    goto(`/object/${noid}`);
  }
</script>

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<Resolver slug="oocihm.8_06941" />
<TypeAhead label="Edit object:" on:selected={slugSelected} />
