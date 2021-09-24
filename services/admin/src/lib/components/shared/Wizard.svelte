<script lang="ts">
  /**
   * @template
   * @description This is the common layout for the wizard like pages
   */

  export let title: string = "";
  export let size: "md" | "lg" = "md";
</script>

<div class="backdrop">
  <div class={`wrapper ${size}`}>
    <div class="title">
      <p>{title}</p>
    </div>
    <div class="form">
      <slot />
    </div>
  </div>
</div>

<style>
  .backdrop {
    padding: var(--perfect-fourth-4);
    background: var(--structural-div-bg); /*var(--color-gradient);*/
    height: 100%;
    min-height: calc(100vh - 7.5rem);
  }
  .form {
    background: var(--base-bg);
    height: 100%;
    min-height: 52rem;
    border-radius: var(--border-radius);
    padding: var(--perfect-fourth-4);
  }
  p {
    color: var(--secondary);
    margin-bottom: var(--margin-sm) !important;
  }
</style>
