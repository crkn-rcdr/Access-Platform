<script lang="ts">
  import { onMount } from "svelte";

  export let activeStepIndex = 0;

  // scroll-stepper-step
  /**
   * @type {HTMLDivElement} This container element holds the drop down menu items
   */
  let container: HTMLDivElement;

  function handleStepChange() {
    console.log(activeStepIndex);

    console.log("container", container);
    if (!container) return;
    let steps = container.getElementsByClassName("scroll-stepper-step");
    for (let i = 0; i < steps.length; i++) {
      if (i <= activeStepIndex) {
        steps[i].classList.add("show");
        steps[i].classList.remove("hide");
      } else {
        steps[i].classList.add("hide");
        steps[i].classList.remove("show");
      }
      console.log(i, "steps", steps[i]);
      if (i === activeStepIndex) steps[i].scrollIntoView();
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
