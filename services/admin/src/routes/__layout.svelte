<script context="module" lang="ts">
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

  export let lapin: TRPCClient<LapinRouter>;

  const { session } = getStores<Session>();

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
