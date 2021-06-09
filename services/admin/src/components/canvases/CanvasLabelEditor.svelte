<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IoMdOpen from "svelte-icons/io/IoMdOpen.svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "../shared/Align.svelte";

  export let canvas: Canvas | null;

  const dispatch = createEventDispatcher();

  function changed() {
    dispatch("changed");
  }
</script>

<div class="backdrop">
  {#if canvas}
    <div id="label">
      <label for="canvasLabel">Canvas Label</label>
      <textarea
        rows="1"
        name="canvasLabel"
        bind:value={canvas["label"]["none"]}
        on:keyup={changed}
      />
    </div>
    <a class="takedown" href="/takedown" target="_blank">
      <Align vertical="center">
        <div class="message">Take this canvas off of the platform</div>
        <div class="icon">
          <IoMdOpen />
        </div>
      </Align>
    </a>
  {/if}
</div>

<style>
  .backdrop {
    width: 100%;
    height: 100%;
    color: var(--light-font);
    background-color: #1b1b1b;
    overflow: hidden;
  }

  #label {
    width: max(80%, 250px);
    margin: auto;
    padding: 24px 0;
  }

  textarea {
    width: 100%;
  }

  .takedown {
    width: max(80%, 250px);
    margin: auto;
    display: block;
  }

  .message {
    font-size: var(--smaller-font-size) !important;
    font-style: italic;
  }

  .icon {
    display: block;
    width: max(1.2vw, 20px);
    height: max(1.2vw, 20px);
    margin-left: 4px;
    margin-top: 0;
  }
</style>
