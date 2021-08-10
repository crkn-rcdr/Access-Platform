<script lang="ts">
  import { onMount } from "svelte";

  export let activeStepIndex = 0;

  // scroll-stepper-step
  /**
   * @type {HTMLDivElement} This container element holds the drop down menu items
   */
  let container: HTMLDivElement;

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

  function handleStepChange() {
    if (!container) return;
    let steps = container.getElementsByClassName("scroll-stepper-step");
    for (let i = 0; i < steps.length; i++) {
      if (i <= activeStepIndex) {
        steps[i].classList.add("show");
        steps[i].classList.remove("hide");
        if (i === activeStepIndex) {
          steps[i].classList.add("scroll-stepper-step-active");
        } else {
          steps[i].classList.remove("scroll-stepper-step-active");
        }
      } else {
        steps[i].classList.add("hide");
        steps[i].classList.remove("show");
      }
      if (i === activeStepIndex && i !== 0 && window) {
        const offset = getOffset(steps[i]);
        const y =
          i === steps.length - 1
            ? offset.top + steps[i].clientHeight
            : offset.top - 20;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  }

  $: {
    activeStepIndex;
    handleStepChange();
  }

  onMount(() => {
    handleStepChange();
  });
</script>

<div bind:this={container} class="scroll-stepper">
  <slot />
</div>
