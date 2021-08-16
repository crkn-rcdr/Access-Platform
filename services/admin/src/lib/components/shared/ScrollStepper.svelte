<!--
@component
### Overview
The scroll stepper component is a component that breaks down a long task into smaller, more digestible, steps for the user. You can either hide the previous steps, or keep them visible. When they are visible, the component will scroll nicely to the next step as the user progresses.

### Properties
|    |    |    |
| -- | -- | -- |
| activeStepIndex: number   | optional | Used to control which step is the active step in the stepper |
| furthestStepVisitedIndex: number  | optional | Used to control which step is the furthest step visited in the stepper. |
| displayPrevious: boolean | optional | If the previous steps to the active step should be 'collapsed' or 'expanded'


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
  import { onMount } from "svelte";

  /**
   * @type {number} Used to control which step is the active step in the stepper
   */
  export let activeStepIndex: number = 0;

  /**
   * @type {number} Used to control which step is the furthest step visited in the stepper. It is reset upon cancelation of a task.
   */
  export let furthestStepVisitedIndex: number = 0;

  /**
   * @type {boolean} If the previous steps to the active step should be 'collapsed' or 'expanded'
   */
  export let displayPrevious: boolean = false;

  /**
   * @type {boolean} If the stepper should scroll to the new active index automatically
   */
  export let enableAutoScrolling: boolean = true;

  /**
   * @type {HTMLDivElement} This container element holds the drop down menu items
   */
  let container: HTMLDivElement;

  /**
   * This function taked the step titles and makes them clickable if they are the furthest visited step or one of its predecessors.
   * @returns void
   */
  function makeVisitedStepsClickable() {
    if (!container) return;
    let stepTitles = container.getElementsByClassName(
      "scroll-stepper-step-title"
    );
    for (let i = 0; i < stepTitles.length; i++) {
      if (i <= furthestStepVisitedIndex && i !== activeStepIndex)
        stepTitles[i].classList.add("clickable");
      else stepTitles[i].classList.remove("clickable");
    }
  }

  /**
   * This function sets the furthest visitied step if needed when the active step changes.
   * @returns void
   */
  function trackFurthestStepVisited() {
    if (activeStepIndex >= furthestStepVisitedIndex)
      furthestStepVisitedIndex = activeStepIndex;
  }

  /**
   * This method enabled changing the active step if a step title is clicked by creating a clicked event handler on all of the step titles.
   * @returns void
   */
  function changeStepOnTitleClick() {
    if (!container) return;
    let stepTitles = container.getElementsByClassName(
      "scroll-stepper-step-title"
    );
    for (let i = 0; i < stepTitles.length; i++) {
      stepTitles[i].addEventListener("click", () => {
        if (i <= furthestStepVisitedIndex) {
          activeStepIndex = i;
          handleStepChange();
        }
      });
    }
  }

  /**
   * This method is a helpful method for getting the true offset of an element from the top of the page.
   * @see https://stackoverflow.com/questions/13716786/getoffset-function-in-chrome-and-safari
   * @returns void
   */
  function getOffset(el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      _x += el.offsetLeft - el.scrollLeft;
      _y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: _y, left: _x };
  }

  /**
   * This method does the following when the active step is changed:
   * 1. Expands the active step, and hides the other steps as indicated by the @var displayPrevious
   * 2. Adds the scroll-stepper-step-active to the active step for appropriate highlighting
   * 3. Scrolls to the active step
   * 4. Removes the scroll-stepper-step-active from any other step.
   * @returns void
   */
  function handleStepChange() {
    if (!container) return;
    let steps = container.getElementsByClassName("scroll-stepper-step");
    for (let i = 0; i < steps.length; i++) {
      if (displayPrevious ? i <= activeStepIndex : i === activeStepIndex) {
        steps[i].classList.add("show");
      } else {
        steps[i].classList.remove("show");
      }

      if (i === activeStepIndex) {
        steps[i].classList.add("scroll-stepper-step-active");
        if (enableAutoScrolling && window && i !== 0) {
          setTimeout(() => {
            const offset = getOffset(steps[i]);
            const y = offset.top - 20;
            console.log(i === steps.length - 1, activeStepIndex, "SCROOLLL", y);
            window.history.scrollRestoration = "manual";
            window.scrollTo({ top: y, behavior: "smooth" });
          }, 10);
        }
      } else {
        steps[i].classList.remove("scroll-stepper-step-active");
      }
    }
  }

  /**
   * This method wraps the various methods that are required to run when the active index changes. It calls @function trackFurthestStepVisited, @function makeVisitedStepsClickable, and @function handleStepChange
   * @returns void
   */
  function handleActiveStepChange() {
    trackFurthestStepVisited();
    makeVisitedStepsClickable();
    handleStepChange();
  }

  /**
   * @listens activeStepIndex
   * @description Watches for changes in the @var activeStepIndex, and calls @function handleActiveStepChange to preform the appropriate actions
   */
  $: {
    activeStepIndex;
    handleActiveStepChange();
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, the @function handleStepChange is called to render the stepper, and the @function changeStepOnTitleClick is called if @var displayPrevious is false.
   */
  onMount(() => {
    handleStepChange();
    if (!displayPrevious) changeStepOnTitleClick();
  });
</script>

<div bind:this={container} class="scroll-stepper">
  <slot />
</div>
