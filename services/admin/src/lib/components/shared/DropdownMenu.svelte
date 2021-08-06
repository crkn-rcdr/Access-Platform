<!--
@component
### Overview
A dropdown menu that can contain any amount of items or links.

### Properties
none

### Usage
```  
<DropdownMenu direction="left">
    <button slot="dropdown-button">Click me!</button>
    <a>I am a link</a>
    <a>I am a link</a>
    <div>I am a div</div>
    <a>I am a link</a>
</DropdownMenu>
```
*Note: See: w3schools.com/howto/howto_js_dropdown.asp*
-->
<script lang="ts">
  import { onMount } from "svelte";

  export let direction: "left" | "right" | "center" = "center";
  /**
   * @type {HTMLDivElement} This container element holds the drop down
   */
  let dropdownWrapper: HTMLDivElement;

  /**
   * @type {HTMLDivElement} This container element holds the drop down menu items
   */
  let dropdownMenu: HTMLDivElement;

  /**
   * @function
   * When the user clicks on the button, toggle between hiding and showing the dropdown content
   */
  function handleDropdownButtonClick() {
    dropdownMenu.classList.toggle("show");
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, add an @event to the window that will close the dropdown menu if the user clicks outside of it
   */
  onMount(() => {
    window.onclick = function (event) {
      const target: Element = event.target;
      if (dropdownWrapper !== target && !dropdownWrapper.contains(target)) {
        if (dropdownMenu.classList.contains("show")) {
          dropdownMenu.classList.remove("show");
        }
      }
    };
  });
</script>

<div class="dropdown auto-align" bind:this={dropdownWrapper}>
  <div on:click={handleDropdownButtonClick} class="dropbtn">
    <slot name="dropdown-button" />
  </div>
  <div
    bind:this={dropdownMenu}
    class={`dropdown-content auto-align auto-align__column dropdown-content-${direction}`}
  >
    <slot />
  </div>
</div>

<style>
  /* The container <div> - needed to position the dropdown content */
  .dropdown {
    position: relative;
  }

  /* The wrapper around the drop down control element */
  .dropbtn {
    cursor: pointer;
  }

  /* Dropdown Content (Hidden by Default) */
  .dropdown-content {
    display: none;
    position: absolute;
    background-color: var(--backdrop-bg);
    min-width: 160px;
    filter: var(--shadow);
    z-index: 1;
    top: 100%;
  }
  :global(.dropdown-content.dropdown-content-left) {
    left: 0;
  }
  :global(.dropdown-content.dropdown-content-right) {
    right: 0;
  }

  /* Links inside the dropdown */
  :global(.dropdown-content > *) {
    color: var(--dark-font);
    padding: var(--perfect-fourth-8) !important;
    text-decoration: none;
    display: block;
    width: 100%;
    cursor: pointer;
  }

  /* Change color of dropdown links on hover */
  :global(.dropdown-content > *:hover) {
    background-color: var(--structural-div-bg);
  }

  /* Adding a disabled option, not bg change */
  :global(.dropdown-content > .disabled:hover) {
    background-color: var(--backdrop-bg);
    cursor: initial;
  }

  /* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
  :global(.dropdown-content.show) {
    display: inline-flex;
  }
</style>
