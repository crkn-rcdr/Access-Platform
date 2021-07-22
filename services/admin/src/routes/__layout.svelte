<script context="module" lang="ts">
  import { getLapin } from "$lib/lapin";

  import type { LapinClient } from "$lib/lapin";
  import type { Load } from "@sveltejs/kit";
  import type { Session } from "$lib/types";

  type RootContext = {
    lapin: LapinClient;
  };

  type RootOutput = {
    context: RootContext;
  };

  export type RootInput = {
    context: RootContext;
  };

  export const load: Load<{ session: Session }, RootOutput> = ({
    fetch,
    session: { apiEndpoint },
  }) => {
    return {
      context: {
        lapin: getLapin({ url: apiEndpoint, fetch }),
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

  a {
    color: var(--base-font-color) !important;
  }
</style>
