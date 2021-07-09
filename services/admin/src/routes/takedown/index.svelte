<script lang="ts">
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Canvas";
  import type {
    Manifest,
    Canvas as ManifestCanvas,
  } from "@crkn-rcdr/access-data/src/access/Manifest";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import ManifestCanvasSelector from "$lib/components/manifests/ManifestCanvasSelector.svelte";
  import { onMount } from "svelte";

  let originalCanvas: Canvas = {
    id: "69429/c0cj87k0gq3s",
    ocrType: "alto",
    ocrPdf: {
      size: 953240,
      path: "oocihm.8_06941_2/data/sip/data/files/0008.pdf",
    },
    source: {
      path: "oocihm.8_06941_2/data/sip/data/files/0008.jpg",
      from: "cihm",
    },
    master: {
      path: "oocihm.8_06941_2/data/sip/data/files/0008.jpg",
      height: 4224,
      size: 1363751,
      mime: "image/jpeg",
      width: 2968,
    },
  };
  let takedownManifest: Manifest = {
    id: "69429/m0696zw19t6s",
    _rev: "1-ea1f9f2304d194cd9b6f46e4f59d8d04",
    updateInternalmeta: {
      processDate: "2021-01-17T06:42:37Z",
      requestDate: "2021-01-13T20:00:34Z",
      message: "",
      succeeded: true,
    },
    dmdType: "issueinfo",
    from: "canvases",
    type: "manifest",
    canvases: [
      {
        id: originalCanvas["id"],
        label: {
          none: "Original",
        },
      },
      {
        id: "69429/c09s1kj9h004",
        label: {
          none: "Image 1",
        },
      },
      {
        id: "69429/c0610vs1v70v",
        label: {
          none: "Image 2",
        },
      },
      {
        id: "69429/c02805046f82",
        label: {
          none: "Image 3",
        },
      },
      {
        label: {
          none: "Image 4",
        },
        id: "69429/c0xg9f66k47d",
      },
      {
        id: "69429/c0sq8qd8xc3v",
        label: {
          none: "Image 5",
        },
      },
      {
        label: {
          none: "Image 6",
        },
        id: "69429/c0nz80n18k93",
      },
      {
        label: {
          none: "Image 7",
        },
        id: "69429/c0j678v3mt8m",
      },
      {
        id: "69429/c0dj58f8t71q",
        label: {
          none: "Image 8",
        },
      },
    ],
    public: "2020-08-30T00:52:39Z",
    slug: "oocihm.8_06941_1",
    label: {
      none: "Vol. I, No. 1 (October 17, 1891)",
    },
  };

  let selectedCanvases: ManifestCanvas[] = [];

  function handleSelectPressed() {
    console.log(selectedCanvases);
    console.log("Update the image in the backend...");
  }

  onMount(() => {
    if (takedownManifest?.["canvases"]?.[0]) {
      console.log("HERE");
      selectedCanvases = [takedownManifest["canvases"][0]];
      console.log(selectedCanvases);
    }
  });
</script>

<!--Canvas name - image -> image replacement-->

<div class="wrapper">
  <Toolbar title={`Choose an image to display for the canvas:`}>
    <div class="auto-align auto-align__j-end">
      <button
        class="save"
        class:opacity-hidden={selectedCanvases.length ? false : true}
        on:click={handleSelectPressed}>Save</button
      >
    </div>
  </Toolbar>
  <div class="template-wrapper">
    <ManifestCanvasSelector
      manifest={takedownManifest}
      fullPage={false}
      multiple={false}
      bind:selectedCanvases
    />
  </div>

  <!--{#each takedownManifest["canvases"] as template}
      <CanvasSelectorGridTile
        {canvas}
        on:tileClicked={handleSelection}
        on:tilePreviewClicked={handlePreview}
      />
    {/each}-->
</div>

<style>
  .template-wrapper {
    background: var(--backdrop-bg);
    padding: 3rem;
    height: 100vh;
  }
</style>
