<script lang="ts">
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";

  export let results: CanvasManifest[] = [];

  function handleSearch() {
    results = [
      {
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
      },
    ];
  }
</script>

<input
  class="search"
  placeholder="Search for a manifest to add canvases from..."
/>

<button class="primary" on:click={handleSearch}>Search</button>

<style>
  .search {
    flex: 9;
    margin-right: 1rem;
    margin-top: 0;
  }
</style>
