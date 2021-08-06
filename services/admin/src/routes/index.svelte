<script context="module" lang="ts">
  /**
   * @module
   * @description tests the lapin connection
   */
  import type { Load } from "@sveltejs/kit";

  export const load: Load<RootLoadOutput> = async ({ context }) => {
    return {
      props: {
        lapin: context.lapin,
      },
    };
  };
</script>

<script lang="ts">
  /**
   * @file
   * @description This is the main page for the app
   */
  import { goto } from "$app/navigation";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";

  import { onMount } from "svelte";
  import type { RootLoadOutput } from "$lib/types";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import DropdownMenu from "$lib/components/shared/DropdownMenu.svelte";

  /**
   * @type {TRPCClient<any>} Allows for communication to the lapin api
   */
  export let lapin;

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
  <div class="notifications">
    <!--NotificationBar message="New fix pushed!" status="success" />
    <NotificationBar message="There is some error!" status="fail" />
    <NotificationBar
      message="The platform is experiencing an outage."
      status="warn"
    /-->
  </div>
  <div class="center">
    <div class="title">
      <img
        width="520"
        src="/static/canadiana-pa-tag-color.png"
        alt="Canadiana by CRKN, par RCDR"
      />
    </div>
    <div class="search">
      <TypeAhead
        placeholder="Search for existing canvases and manifests to edit..."
        on:selected={slugSelected}
      />
    </div>
  </div>
</div>

<style>
  .notifications {
    padding-top: var(--perfect-fourth-3);
  }
  .center {
    padding-top: var(--perfect-fourth-1);
    text-align: center;
  }
  .title,
  .title img {
    position: relative;
    margin: auto;
  }
  .search {
    position: relative;
    margin: auto;
    width: 65%;
    margin-top: var(--perfect-fourth-2);
    padding-left: 6rem;
  }
</style>
