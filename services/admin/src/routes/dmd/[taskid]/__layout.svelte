<script lang="ts">
  /**
   * @template
   * @description This is the common layout for the dmd task updater pages
   */
  import Wizard from "$lib/components/shared/Wizard.svelte";
</script>

<Wizard
  title={`
<a href="/dmd"  style="color:var(--primary) !important">&#x2B05; Back to all metadata tasks</a>
`}
>
  <slot />
</Wizard>
