<!--
@component
### Overview
A step (section) of a ScrollStepper. Generally used to isolate a group of required inputs or actions for a larger task. When the step is active, the page will scroll nicely to it.

### Properties
|    |    |    |
| -- | -- | -- |
| title: string  | optional | The title to be displayed for the step |
| status: "success" or "fail" or "warn" or "neutral"  | optional | The status of the step, used to display the icon in an appropriate color |
: isLastStep: boolean | optional | If the step is the last step or not. Set this to hide the line to the next step. (TODO: remove the need for this) |


### Usage
```  
<ScrollStepper bind:activeIndex>
  <ScrollStepperStep title="Step number 1">
    <div slot="icon">1/div>
    ... step body
  </ScrollStepperStep>
  <ScrollStepperStep 
    title="Step number 2" 
    isLastStep={true}>
    <div slot="icon">2/div>
    ... step body
  </ScrollStepperStep>
</ScrollStepper>

```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  /**
   * @type {string} The title to be displayed for the step
   */
  export let title: string = "";

  /**
   * @type {"success" | "fail" | "warn" | "neutral"} The status of the step, used to display the icon in an appropriate color
   */
  export let status: "success" | "fail" | "warn" | "neutral" = "neutral";

  /**
   * @type {boolean} If the step is the last step or not. Set this to hide the line to the next step. (TODO: remove the need for this)
   */
  export let isLastStep: boolean = false;
</script>

<div
  class="scroll-stepper-step"
  class:scroll-stepper-step-not-last={!isLastStep}
>
  <h6
    class="scroll-stepper-step-title auto-align auto-align__block auto-align__a-center"
  >
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
    /*z-index: 1;*/
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
  .scroll-stepper-step-title.clickable {
    cursor: pointer;
  }
  .scroll-stepper-step .scroll-stepper-step-body {
    padding-left: 5rem;
  }
</style>
