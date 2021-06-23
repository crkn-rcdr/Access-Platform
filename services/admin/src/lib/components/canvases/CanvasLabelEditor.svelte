<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IoMdOpen from "svelte-icons/io/IoMdOpen.svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";

  export let canvas: Canvas;

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
      <div class="auto-align auto-align__a-center">
        <div class="message">Take this canvas off of the platform</div>
        <div class="icon">
          <IoMdOpen />
        </div>
      </div>
    </a>
  {/if}
</div>

<style>
  .backdrop {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  #label {
    width: max(80%, 15rem);
    margin: auto;
    padding: 1.5rem 0;
  }

  textarea {
    width: 100%;
  }

  .takedown {
    width: max(80%, 15rem);
    margin: auto;
    display: block;
  }

  .message {
    font-style: italic;
    font-size: var(--perfect-fourth-8);
  }

  .icon {
    display: block;
    width: var(--perfect-fourth-7);
    height: var(--perfect-fourth-7);
    margin-left: 0.5rem;
    margin-top: 0;
  }

  a {
    color: var(--light-font) !important;
  }
</style>
