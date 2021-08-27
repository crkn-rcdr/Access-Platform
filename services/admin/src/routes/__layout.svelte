<script context="module" lang="ts">
  /**
   * @module
   * @description Creates a lapin router for the app to interact with
   */
  import type { LapinRouter } from "@crkn-rcdr/lapin-router";
  import type { Load } from "@sveltejs/kit";
  import type { TRPCClient } from "@trpc/client";
  import type { RootLoadOutput, ServerSession, Session } from "$lib/types";
  import { createTRPCClient } from "@trpc/client";

  export const load: Load<{ session: ServerSession }, RootLoadOutput> = ({
    fetch,
    session: { apiEndpoint },
  }) => {
    const lapin = createTRPCClient<LapinRouter>({
      url: apiEndpoint,
      fetch,
    });
    return {
      context: { lapin },
      props: { lapin },
    };
  };
</script>

<script lang="ts">
  /**
   * @template
   * @description This is the common layout for the application
   */
  import FaRegQuestionCircle from "svelte-icons/fa/FaRegQuestionCircle.svelte";
  import FaRegUserCircle from "svelte-icons/fa/FaRegUserCircle.svelte";
  import { getStores } from "$app/stores";
  import DropdownMenu from "$lib/components/shared/DropdownMenu.svelte";

  /**
   * @type {TRPCClient<LapinRouter>} Allows the app to to speak to the lapin api
   */
  export let lapin: TRPCClient<LapinRouter>;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /** Allows all other pages to access lapin */
  session.set({ ...$session, lapin });
</script>

<pre
  class="site-nav auto-align auto-align__block auto-align__a-center auto-align__j-between auto-align__wrap">
  <a href="/"><img width="220" src="/static/canadiana-pa-tag-color.png" alt="canadiana by CRKN, par RCDR"/></a>

  <nav class="auto-align auto-align__wrap">
    <a href="/import">Import from Preservation</a>
    <a href="/dmd/new">Update Descriptive Metadata</a>

    <DropdownMenu direction="right">
      <div slot="dropdown-button" class="disabled">
        <a href="/">Create New Object</a>
      </div>
      <a href="/object/new">
        Collection
      </a>
      <a href="/object/new">
        Manifest
      </a>
    </DropdownMenu>
  </nav>
  
  <div class="right-menu auto-align auto-align__a-center">
    <a href="https://github.com/crkn-rcdr/Access-Platform/issues" target="_blank" data-tooltip="Click for help!" data-tooltip-flow="bottom">
      <div class="icon">
        <FaRegQuestionCircle/>
      </div>
    </a>
    <DropdownMenu direction="right">
      <div slot="dropdown-button" class="icon">
        <FaRegUserCircle/>
      </div>
      <div class="disabled">Logged in as: <b>{$session.user.name}</b>, {$session.user.email}.</div>
    </DropdownMenu>
  </div>
</pre>
<slot />

<style>
  @font-face {
    font-family: "Roboto";
    src: url("/static/fonts/Roboto-Regular.ttf") format("truetype");
  }
  pre {
    position: relative;
    z-index: 1;
  }
  .site-nav {
    padding: 0 1rem;
    background-color: var(--base-bg);
    /*filter: brightness(1.1);*/
    z-index: 0;
  }
  .icon {
    padding: 0.1rem;
  }
  nav > * {
    font-family: "Roboto";
    margin-right: var(--perfect-fourth-4);
    color: var(--primary) !important;
    width: min-content;
  }
  .right-menu > * {
    margin-right: 1rem;
  }
</style>
