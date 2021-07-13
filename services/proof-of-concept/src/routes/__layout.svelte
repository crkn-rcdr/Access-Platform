<script context="module" lang="ts">
  import { getLapin } from "$lib/lapin";

  import type { LapinClient } from "$lib/lapin";
  import type { Load } from "@sveltejs/kit";

  type RootContext = {
    lapin: LapinClient;
  };

  type RootOutput = {
    context: RootContext;
  };

  export type RootInput = {
    context: RootContext;
  };

  export const load: Load<{}, RootOutput> = ({ fetch }) => {
    return {
      context: {
        lapin: getLapin(fetch),
      },
    };
  };
</script>

<slot />
