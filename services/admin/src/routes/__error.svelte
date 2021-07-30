<script context="module" lang="ts">
  /**
   * @module
   * @description Catches any errors
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
   * @description Displays the error to the user
   */
  export let title: string;
</script>

<h1>{title}</h1>
