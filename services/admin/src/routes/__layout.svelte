<script context="module" lang="ts">
  import FaRegUserCircle from "svelte-icons/fa/FaRegUserCircle.svelte";
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
  import { getStores } from "$app/stores";
  import DropdownMenu from "$lib/components/shared/DropdownMenu.svelte";

  export let lapin: TRPCClient<LapinRouter>;

  const { session } = getStores<Session>();

  session.set({ ...$session, lapin });
</script>

<pre
  class="site-nav auto-align auto-align__block auto-align__a-center auto-align__j-between auto-align__wrap">
  <a href="/"><img width="200" src="/static/canadiana-tag-color.svg" alt="canadiana.ca"/></a>

  <nav class="auto-align">
    <a href="/import">Import Packages</a>
    <a href="/dmd/new">New DMD Task</a>
    <a href="/object/new">New Object</a>
  </nav>
  
  <DropdownMenu direction="right">
    <div slot="dropdown-button" class="icon">
      <FaRegUserCircle/>
    </div>
    <div class="disabled">Logged in as: <b>{$session.user.name}</b>, {$session.user.email}.</div>
  </DropdownMenu>
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
    background-color: var(--structural-div-bg);
    filter: brightness(1.1);
  }
  .icon {
    padding: 0.1rem;
  }
  nav > * {
    font-family: "Roboto";
    margin-right: var(--perfect-fourth-4);
    color: var(--primary) !important;
  }
</style>
