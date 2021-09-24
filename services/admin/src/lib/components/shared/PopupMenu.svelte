<!--
@component
### Overview
A popup menu that can contain any amount of items or links.

### Properties
none

### Usage
```  
<popupMenu direction="left">
    <button slot="popup-button">Click me!</button>
    <a>I am a link</a>
    <a>I am a link</a>
    <div>I am a div</div>
    <a>I am a link</a>
</popupMenu>
```
*Note: See: w3schools.com/howto/howto_js_popup.asp*
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let direction: "left" | "right" | "center" = "center";
  /**
   * @type {HTMLDivElement} This container element holds the drop down
   */
  let popupWrapper: HTMLDivElement;

  /**
   * @type {HTMLDivElement} This container element holds triggers the drawing of the menu
   */
  let popupButton: HTMLDivElement;

  /**
   * @type {HTMLDivElement} This container element holds the drop down menu items
   */
  let popupMenu: HTMLDivElement;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();
  /**
   * @function
   * When the user clicks on the button, toggle between hiding and showing the popup content
   */
  function handlepopupButtonClick() {
    popupMenu.classList.toggle("show");
  }

  function handleCancelPressed() {
    popupMenu.classList.remove("show");
    dispatch("cancel");
  }
  function handleOkPressed() {
    popupMenu.classList.remove("show");
    dispatch("ok");
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, add an @event to the window that will close the popup menu if the user clicks outside of it
   */
  /*onMount(() => {
    window.addEventListener("click", function (event) {
      const target = event.target as Node;
      if (!popupWrapper?.contains(target)) {
        if (popupMenu?.classList.contains("show")) {
          popupMenu.classList.remove("show");
        }
      }
    });
  });*/
</script>

<div class="popup auto-align" bind:this={popupWrapper}>
  <div
    bind:this={popupButton}
    on:click={handlepopupButtonClick}
    class="dropbtn"
  >
    <slot name="popup-button" />
  </div>
  <div
    bind:this={popupMenu}
    class={`popup-content auto-align auto-align__column popup-content-${direction}`}
  >
    <div class="popup-body">
      <slot />
    </div>
    <div class="popup-actions">
      <button class="secondary sm" on:click={handleCancelPressed}>Cancel</button
      >
      <button class="primary sm" on:click={handleOkPressed}>Ok</button>
    </div>
  </div>
</div>

<style>
  /* The container <div> - needed to position the popup content */
  .popup {
    position: relative;
  }

  /* The wrapper around the drop down control element */
  .dropbtn {
    cursor: pointer;
  }

  /* popup Content (Hidden by Default) */
  .popup-content {
    font-weight: 400;
    display: none;
    position: absolute;
    background-color: var(--base-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    min-width: 20rem;
    filter: var(--shadow);
    z-index: 1;
    top: 100%;
    padding: 1rem 1rem 0.5rem 1rem;
    text-align: left;
  }
  :global(.popup-content.popup-content-left) {
    left: 0;
  }
  :global(.popup-content.popup-content-right) {
    right: 0;
  }
  /* Show the popup menu (use JS to add this class to the .popup-content container when the user clicks on the popup button) */
  :global(.popup-content.show) {
    display: inline-flex;
  }

  .popup-actions {
    width: 100%;
    text-align: right;
  }
</style>
