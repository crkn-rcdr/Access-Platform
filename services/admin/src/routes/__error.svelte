<script context="module" lang="ts">
  /**
   * @module
   * @description
   */
  import type { ErrorLoad } from "@sveltejs/kit";
  export const load: ErrorLoad = ({ error, status }) => {
    return {
      props: {
        title: `${status}: ${error.message}`,
      },
    };
  };
</script>

<script lang="ts">
  /**
   * @template
   * @description
   */
  export let title: string;
</script>

<h1>{title}</h1>
