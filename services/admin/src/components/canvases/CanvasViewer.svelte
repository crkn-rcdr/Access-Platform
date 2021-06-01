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
        "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000004.jp2",
      ],
    });
  });
  /* 
  icons to canvas from old place

  need to know the noid we have an image server like this
go to any of our environments add www.canadiana.ca/demo

https://image-uvic.canadiana.ca/iiif/2/69429%2Fc0b56d40px5r/full/!800,800/0/default.jpg


    What we need to set up: https://iiif.io/api/image/3.0/#2-uri-syntax
    
    full url: https://iiif.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000004.jp2/full/680,/0/default.jpg
    Example return from id

{
    "@context":"http://iiif.io/api/image/2/context.json",
    "@id":"https://iiif.princeton.edu/loris/iiif/2/pudl0001%2F4609321%2Fs42%2F00000004.jp2",
    "protocol":"http://iiif.io/api/image",
    "width":5434,
    "height":7200,"
    sizes":[
        {"width":85,"height":113},
        {"width":170,"height":225},
        {"width":340,"height":450},
        {"width":679,"height":900},
        {"width":1359,"height":1800},
        {"width":2717,"height":3600},
        {"width":5434,"height":7200}
    ],
    "tiles":[
        {
            "width":680,
            "height":900,
            "scaleFactors":[1,2,4,8,16,32,64]}],
            "profile":[
                "http://iiif.io/api/image/2/level2.json",
                {
                    "formats":["jpg","tif","gif","png"],
                    "qualities":["bitonal","default","gray","color"],
                    "supports":["regionByPx","sizeByW","sizeByWhListed","cors","regionSquare","sizeByDistortedWh","sizeAboveFull","canonicalLinkHeader","sizeByConfinedWh","sizeByPct","jsonldMediaType","regionByPct","rotationArbitrary","sizeByH","baseUriRedirect","rotationBy90s","profileLinkHeader","sizeByForcedWh","sizeByWh","mirroring"]
                }
            ]
        }
    ]
}
*/
</script>

<div
  id="openseadragon1"
  style="
width: 595px;
height: 100%;"
/>
