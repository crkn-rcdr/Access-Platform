<script lang="ts">
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
      <a id="takedown"> Take this canvas off of the platform ico </a>
    </Align>
  </div>
{/if}

<style>
  .backdrop {
    width: 319px;
    height: 100%;
    /*background-color: rgb(240 240 240);*/
    color: white;
    background-color: #242525;
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
  #takedown {
    padding: 24px;
    font-size: 16px;
    font-style: italic;
  }
</style>
