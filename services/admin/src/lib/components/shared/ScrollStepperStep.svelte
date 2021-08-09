<script lang="ts">
  export let title: string = "";
  export let status: "success" | "fail" | "warn" | "neutral" = "neutral";
  export let isLastStep: boolean = false;
</script>

<div
  class="scroll-stepper-step"
  class:scroll-stepper-step-not-last={!isLastStep}
>
  <h6 class="auto-align auto-align__block auto-align__a-center">
    <div
      class={`step-icon step-icon-${status} auto-align auto-align__j-center auto-align__a-center`}
    >
      <slot name="icon" />
    </div>
    {title}
  </h6>
  <div class="scroll-stepper-step-body">
    <slot />
  </div>
</div>

<style>
  .scroll-stepper-step-not-last::before {
    content: "";
    position: absolute;
    top: 8.7rem;
    bottom: -5rem;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.2);
    left: 1.4rem;
    z-index: 0;
  }
  .scroll-stepper-step {
    position: relative;
    padding: var(--perfect-fourth-2) 0;
    z-index: 1;
  }
  :global(.scroll-stepper-step.show .scroll-stepper-step-body) {
    display: block;
  }
  :global(.scroll-stepper-step.hide .scroll-stepper-step-body) {
    display: none;
  }
  h6 {
    padding: var(--perfect-fourth-8) 0;
    /*border-bottom: 1px solid var(--border-color);*/
  }
  :global(.scroll-stepper-step .step-icon) {
    width: var(--perfect-fourth-4);
    height: var(--perfect-fourth-4);
    background: var(--secondary);
    border-radius: 50%;
    color: var(--light-font);
    margin-right: 1rem;
  }
  :global(.scroll-stepper-step-active .step-icon) {
    background: var(--primary);
  }
  :global(.scroll-stepper-step-active .step-icon.step-icon-success) {
    background: var(--success);
  }
  :global(.scroll-stepper-step-active .step-icon.step-icon-warn) {
    background: var(--warn);
  }
  :global(.scroll-stepper-step-active .step-icon.step-icon-fail) {
    background: var(--danger);
  }
  .scroll-stepper-step .scroll-stepper-step-body {
    padding-left: 5rem;
  }
</style>
