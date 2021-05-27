<script>
    import { onMount } from "svelte";

    onMount(async () => {
        let OpenSeadragon = await import("openseadragon");
        console.log(OpenSeadragon);

        let viewer = OpenSeadragon.default({
            id: "openseadragon1",
            prefixUrl: "/openseadragon/images/",
            preserveViewport: true,
            visibilityRatio: 1,
            minZoomLevel: 1,
            defaultZoomLevel: 1,
            sequenceMode: false,
            tileSources: [
                {
                    "@context": "http://iiif.io/api/image/2/context.json",
                    "@id": "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000004.jp2",
                    height: 7200,
                    width: 5434,
                    profile: ["http://iiif.io/api/image/2/level2.json"],
                    protocol: "http://iiif.io/api/image",
                    tiles: [
                        {
                            scaleFactors: [1, 2, 4, 8, 16, 32],
                            width: 1024,
                        },
                    ],
                },
            ],
        });
    });
</script>

<div id="openseadragon1" style="
width: 554px;
height: 100%;" />
