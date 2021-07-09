<script lang="ts">
  import { onMount } from "svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Canvas";
  import type {
    Manifest,
    Canvas as ManifestCanvas,
  } from "@crkn-rcdr/access-data/src/access/Manifest";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import Modal from "$lib/components/shared/Modal.svelte";
  import CanvasesSelector from "$lib/components/canvases/CanvasesSelector.svelte";

  // Grabs whatever the canvas is pointing to in the backend.
  let canvas: Canvas = {
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
        id: canvas["id"],
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

  let saveImageModal = false;
  let showSave = false;

  function handleSelected() {
    if (selectedCanvases?.[0]?.["id"] !== canvas["id"]) showSave = true;
    else showSave = false;
    console.log(showSave, selectedCanvases, canvas);
  }

  function handleSavePressed() {
    saveImageModal = false;
    showSave = false;
    if (selectedCanvases?.length && selectedCanvases?.[0]?.["id"])
      canvas["id"] = selectedCanvases[0]["id"];
  }

  onMount(() => {
    if (takedownManifest?.["canvases"]?.[0]) {
      selectedCanvases = [takedownManifest["canvases"][0]];
    }
  });
</script>

<!--Canvas name - image -> image replacement-->

<div class="wrapper">
  <Toolbar title={`Choose an image to display for the canvas:`}>
    {#if showSave}
      <div class="auto-align auto-align__j-end">
        <button class="save" on:click={() => (saveImageModal = true)}
          >Save</button
        >
      </div>
    {/if}
  </Toolbar>
  <div class="template-wrapper">
    {#if takedownManifest}
      {#if takedownManifest["canvases"] && takedownManifest["canvases"].length}
        <!--on:selected={handleSelection}-->
        <CanvasesSelector
          bind:selectedCanvases
          multiple={false}
          canvases={takedownManifest["canvases"]}
          options={{
            showNavigator: true,
            sequenceMode: true,
            showReferenceStrip: true,
            showHomeControl: false,
            showZoomControl: false,
            showFullPageControl: false,
            showSequenceControl: false,
            referenceStripScroll: "vertical",
            autoHideControls: false,
          }}
        />
      {:else}
        No canvases.
      {/if}
    {/if}
  </div>
</div>

<Modal
  bind:open={saveImageModal}
  title={`Are you sure you want take down this canvas?`}
>
  <p slot="body">
    By taking down this canvas, you will be replacing its image with the one you
    have selected, across all of the manifests it belongs to. You can undo the
    takedown by selecting the original image and pressing save.
  </p>
  <div slot="footer">
    <button class="secondary" on:click={() => (saveImageModal = false)}>
      Cancel
    </button>
    <button class="danger" on:click={handleSavePressed}> Save </button>
  </div>
</Modal>

<style>
  .template-wrapper {
    background: var(--backdrop-bg);
    padding: 3rem;
    height: 84vh;
  }
</style>
