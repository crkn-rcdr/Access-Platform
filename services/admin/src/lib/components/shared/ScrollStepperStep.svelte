<div class="scroll-stepper-step">
  <slot />
</div>

<style>
  :global(.scroll-stepper-step.show) {
    display: block;
  }
  :global(.scroll-stepper-step.hide) {
    display: none;
  }
</style>
