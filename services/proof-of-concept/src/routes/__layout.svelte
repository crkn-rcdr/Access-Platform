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
        lapin: getLapin({ apiEndpoint, fetch }),
      },
    };
  };
</script>

<slot />
