<script lang="ts">
  import IoMdOpen from "svelte-icons/io/IoMdOpen.svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import { createEventDispatcher } from "svelte";
  import Align from "../shared/Align.svelte";

  export let canvas: Canvas;

  const dispatch = createEventDispatcher();

  function changed() {
    dispatch("changed");
  }
</script>

{#if canvas}
  <div class="backdrop">
    <Align direction="column">
      <div id="label">
        <label for="canvasLabel">Canvas Label</label>
        <textarea
          rows="9"
          name="canvasLabel"
          bind:value={canvas["label"]["value"]}
          on:keyup={changed}
        />
      </div>
      <a class="takedown">
        <Align>
          <div class="message">Take this canvas off of the platform</div>
          <div class="icon">
            <IoMdOpen />
          </div>
        </Align>
      </a>
    </Align>
  </div>
{/if}

<style>
  .backdrop {
    width: 319px;
    height: 100%;
    /*background-color: rgb(240 240 240);*/
    color: var(--light-font);
    background-color: var(--dark-grey);
  }
  #label {
    flex: 9;
    width: 273px;
    margin: auto;
    padding-top: 24px;
  }
  textarea {
    width: 93%;
  }
  .takedown {
    padding: 24px;
  }

  .message {
    font-size: 16px !important;
    font-style: italic;
  }

  .icon {
    width: 20px;
    height: 20px;
    margin-left: 2px;
    margin-top: 0;
  }
</style>
