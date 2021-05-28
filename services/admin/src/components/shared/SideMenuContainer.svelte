<script>
  import { onMount } from "svelte";

  import Align from "../../components/shared/Align.svelte";

  let container;

  let pageButtons = [];
  let pageBodies = [];

  let activeIndex = 0;

  function setActivePageButtonClass() {
    for (let i = 0; i < pageButtons.length; i++) {
      if (i === activeIndex) pageButtons[i].classList.add("active");
      else pageButtons[i].classList.remove("active");
    }
  }

  function setActivePageBody() {
    for (let i = 0; i < pageBodies.length; i++) {
      if (i === activeIndex) pageBodies[i].style.display = "block";
      else pageBodies[i].style.display = "none";
    }
  }

  function setPage() {
    setActivePageButtonClass();
    setActivePageBody();
  }

  onMount(() => {
    pageButtons = container.querySelectorAll(".side-menu-page-list-button");

    for (let i = 0; i < pageButtons.length; i++) {
      pageButtons[i].addEventListener("click", (event) => {
        activeIndex = i;
        setPage();
      });
    }

    pageBodies = container.querySelectorAll(".side-menu-page");
    setPage();
  });
</script>

<div bind:this={container} class="side-menu-container">
  <Align vertical="stretch">
    <slot />
  </Align>
</div>

<style>
  .side-menu-container {
    width: 100%;
    height: 100%;
  }
</style>
