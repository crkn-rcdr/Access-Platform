<script lang="ts">
  /**
   * @file
   * @description This is the main page for the app
   */
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";
  import { Noid } from "@crkn-rcdr/access-data";
  //import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import PrefetchLoader from "$lib/components/shared/PrefetchLoader.svelte";

  /**
   * @type {string} The link to the object selected form the search bar.
   */
  let objectHref: string;

  /**
   * Routes to the object the user clicks from the TypeAhead component
   * @param event
   * @returns void
   */
  async function slugSelected(event: CustomEvent<string>) {
    const noid = event.detail;
    try {
      if (Noid.parse(noid)) objectHref = `/object/${noid}`;
    } catch (e) {
      console.log(e);
    }
  }
</script>

<PrefetchLoader bind:href={objectHref}>
  <div class="notifications">
    <!--NotificationBar message="New fix pushed!" status="success" />
    <NotificationBar message="There is some error!" status="fail" />
    <NotificationBar
      message="The platform is experiencing an outage."
      status="warn"
    /-->
  </div>
  <div class="title">
    <img
      class="logo"
      src="/static/canadiana-pa-tag-color.png"
      alt="Canadiana by CRKN, par RCDR"
    />
  </div>
  <div class="search">
    <TypeAhead
      placeholder="Search for existing collections and manifests to edit..."
      on:selected={slugSelected}
    />
  </div>
</PrefetchLoader>

<style>
  .notifications {
    padding-top: var(--perfect-fourth-3);
  }
  .title,
  .title img {
    position: relative;
    margin: auto;
  }

  .logo {
    width: 22rem;
  }
  .search {
    position: relative;
    margin: auto;
    width: 65%;
    margin-top: var(--perfect-fourth-2);
    min-width: 25rem;
  }

  @media (min-width: 1025px) {
    .logo {
      width: 34rem;
    }
    .search {
      padding-left: 5.5rem;
    }
  }
</style>
