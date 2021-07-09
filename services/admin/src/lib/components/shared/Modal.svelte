<script>
  import TiTimes from "svelte-icons/ti/TiTimes.svelte";
  export let open = false;
  export let title = "Modal";
</script>

{#if open}
  <div
    class="modal-backdrop auto-align auto_align__full auto-align__a-center auto-align__j-center"
  >
    <div class="modal">
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
    z-index: 1;
  }

  .modal {
    position: relative;
    background-color: var(--base-bg);
    width: 50rem;
    max-width: 100%;
    height: 25rem;
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
    /*position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: var(--perfect-fourth-6);*/
  }
</style>
