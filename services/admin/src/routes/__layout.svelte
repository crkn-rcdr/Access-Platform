<script context="module" lang="ts">
  import type { LapinRouter } from "@crkn-rcdr/lapin-router";
  import type { Load } from "@sveltejs/kit";
  import type { TRPCClient } from "@trpc/client";
  import type { Session } from "$lib/types";

  type RootContext = {
    lapin: TRPCClient<LapinRouter>;
  };

  export type RootOutput = {
    context: RootContext;
  };

  import { createTRPCClient } from "@trpc/client";

  export const load: Load<{ session: Session }, RootOutput> = ({
    fetch,
    session: { apiEndpoint },
  }) => {
    return {
      context: {
        lapin: createTRPCClient<LapinRouter>({ url: apiEndpoint, fetch }),
      },
    };
  };
</script>

<script lang="ts">
  import { session } from "$app/stores";
</script>

<pre>
  {#if session}
    <nav class="site-nav">
        Session: {JSON.stringify($session, null, 2)}
    </nav>
  {/if}
</pre>
<slot />

<style>
  .site-nav {
    padding: 1.5rem 1rem;
    background-color: var(--structural-div-bg);
    filter: brightness(1.1);
  }
</style>
