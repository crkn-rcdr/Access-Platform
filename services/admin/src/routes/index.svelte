<script lang="ts">
  /**
   * @file
   * @description This is the main page for the app
   */
  import { goto } from "$app/navigation";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";

  /**
   * Routes to the object the user clicks from the TypeAhead component
   * @param event
   * @returns void
   */
  function slugSelected(event: CustomEvent<string>) {
    const noid = event.detail;
    goto(`/object/${noid}`);
  }
</script>

<div class="wrapper">
  <TypeAhead
    placeholder="Search for a collection or manifest..."
    on:selected={slugSelected}
  />
</div>
