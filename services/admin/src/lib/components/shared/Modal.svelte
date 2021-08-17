<!--
@component
### Overview
A component that overlays ontop of the application, in the center of the screen.
### Properties
|    |    |    |
| -- | -- | -- |
| open : boolean    | required | The state control for showing or hiding the modal |
| title : string    | optional | The title text of the modal. |
| size : "sm" or "md" or "lg"   | optional | The size setting for the modal. |
### Usage
```  
<Modal
  bind:open={aBooleanVariable}
  title={"Do something"}
>
  <div slot="body">
    ...content
  </div>
  <div slot="footer">
    ... buttons
  </div>
</Modal>
```
*Note: `bind:` is required for changes to the object and its model to be reflected in higher level components.*
-->
<script lang="ts">
  import TiTimes from "svelte-icons/ti/TiTimes.svelte";
  /**
   * @type {boolean} The state control for showing or hiding the modal.
   */
  export let open = false;
  /**
   * @type {string} The title text of the modal.
   */
  export let title = "";
  /**
   * @type {"sm" | "md" | "lg"} The title text of the modal.
   */
  export let size: "sm" | "md" | "lg" = "sm";
  let body: HTMLBodyElement;
  $: {
    if (body) {
      if (open) {
        body.classList.add("no-scroll"); //`height: 100%;overflow: hidden;`;
      } else {
        body.classList.remove("no-scroll");
      }
    }
  }
</script>

<svelte:body bind:this={body} />
{#if open}
  <div
    class="modal-backdrop auto-align auto_align__full auto-align__a-center auto-align__j-center"
  >
    <div class={`modal ${size}`}>
      <div class="modal-inner">
        <div class="modal-header auto-align">
          <h6>{title}</h6>
          <div
            class="action icon"
            on:click={() => {
              open = false;
            }}
          >
            <TiTimes />
          </div>
        </div>
        <div class="modal-body">
          <slot name="body" />
        </div>
        <div
          class="modal-footer auto-align auto-align__a-end auto-align__j-end"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    background-color: var(--overlay-bg);
    z-index: 2;
  }
  .modal {
    position: relative;
    background-color: var(--base-bg);
    text-align: left;
  }
  .modal.sm {
    width: 50rem;
    max-width: 100%;
    height: 25rem;
    max-height: 100%;
  }
  .modal.md {
    width: 65rem;
    max-width: 100%;
    height: 50rem;
    max-height: 100%;
  }
  .modal.lg {
    width: 85rem;
    max-width: 100%;
    height: 75rem;
    max-height: 100%;
  }
  .modal-inner {
    display: grid;
    grid-template-areas:
      "header"
      "body"
      "footer";
    grid-template-rows: 0.5fr 2fr 0.5fr;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: var(--perfect-fourth-6);
  }
  .modal-header {
    grid-area: header;
  }
  .modal-header h6 {
    flex: 9;
  }
  .modal-body {
    grid-area: body;
  }
  .modal-footer {
    grid-area: footer;
  }
  :global(body.no-scroll) {
    height: 100vh;
    overflow: hidden;
  }
</style>
