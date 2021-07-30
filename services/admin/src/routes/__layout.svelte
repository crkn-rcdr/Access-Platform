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
  import { getStores } from "$app/stores";

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

<pre>
  <nav class="site-nav">
    Logged in as: <b>{$session.user.name}</b>, {$session.user.email}.
  </nav>
</pre>
<slot />

<style>
  .site-nav {
    padding: 0 1rem;
    background-color: var(--structural-div-bg);
    filter: brightness(1.1);
  }
</style>
