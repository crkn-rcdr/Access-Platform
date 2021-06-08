<script lang="ts">
  import { onMount } from "svelte";

  import Align from "../../components/shared/Align.svelte";

  let container: HTMLDivElement;

  let pageButtons: NodeListOf<Element>;
  let pageBodies: NodeListOf<Element>;

  let activeIndex = 0;

  function setActivePageButtonClass() {
    for (let i = 0; i < pageButtons.length; i++) {
      if (i === activeIndex) pageButtons?.[i]?.classList?.add("active");
      else pageButtons?.[i]?.classList?.remove("active");
    }
  }

  function setActivePageBody() {
    for (let i = 0; i < pageBodies.length; i++) {
      if (i === activeIndex) pageBodies?.[i]?.classList?.remove("hidden");
      else pageBodies?.[i]?.classList?.add("hidden");
    }
  }

  function setPage() {
    setActivePageButtonClass();
    setActivePageBody();
  }

  function enablePaging() {
    for (let i = 0; i < pageButtons.length; i++) {
      pageButtons?.[i]?.addEventListener("click", () => {
        activeIndex = i;
        setPage();
      });
    }
  }

  onMount(() => {
    pageButtons = container.querySelectorAll(".side-menu-page-list-button");
    pageBodies = container.querySelectorAll(".side-menu-page");
    enablePaging();
    setPage();
  });
</script>

<div bind:this={container} class="side-menu-container">
  <Align display="flex" vertical="stretch">
    <slot />
  </Align>
</div>

<style>
  .side-menu-container {
    width: 100%;
    height: 100%;
  }
</style>
