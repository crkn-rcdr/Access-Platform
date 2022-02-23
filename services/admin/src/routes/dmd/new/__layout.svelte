<script lang="ts">
  /**
   * @template
   * @description This is the common layout for the dmd task updater pages
   */
  import Wizard from "$lib/components/shared/Wizard.svelte";
</script>

<Wizard title="Metadata Loader">
  <slot />
</Wizard>
