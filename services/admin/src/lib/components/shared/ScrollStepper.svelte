<script lang="ts">
  import { onMount } from "svelte";

  export let activeStepIndex = 0;

  // scroll-stepper-step
  /**
   * @type {HTMLDivElement} This container element holds the drop down menu items
   */
  let container: HTMLDivElement;

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
        const y =
          i === steps.length - 1
            ? steps[i].getBoundingClientRect().top + steps[i].clientHeight
            : steps[i].getBoundingClientRect().top - 20;
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
