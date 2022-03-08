<script lang="ts">
  import { onMount } from "svelte";

  export let xml: string = "";
  export let shouldClip: boolean = false;
  let clipped: boolean;

  function formatXml(xml) {
    var formatted = "";
    var reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, "$1\r\n$2$3");
    var pad = 0;

    let xmlArr = xml.split("\r\n");
    for (const node of xmlArr) {
      var indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad != 0) {
          pad -= 1;
        }
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }

      var padding = "";
      for (var i = 0; i < pad; i++) {
        padding += "&nbsp;&nbsp;&nbsp;&nbsp;";
      }

      formatted += padding + node + "\r\n";
      pad += indent;
    }

    return formatted;
  }

  $: xml = formatXml(xml);

  let height;
  onMount(() => {
    shouldClip = shouldClip && height > 50;
    if (shouldClip) clipped = true;
  });
</script>

<code class:clip={shouldClip && clipped} bind:clientHeight={height}>
  {xml.trim()}
</code>
{#if shouldClip}
  {#if clipped === true}
    <span class="toggler" on:click={() => (clipped = !clipped)}>
      show more...
    </span>
  {:else if clipped === false}
    <span class="toggler" on:click={() => (clipped = !clipped)}>
      show less
    </span>
  {/if}
{/if}

<style>
  code {
    padding: 0 1rem;
    display: block;
    white-space: pre-wrap;
  }
  .toggler {
    cursor: pointer;
    font-weight: bold;
    margin-left: 1rem;
  }
  .clip {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
  }
</style>
