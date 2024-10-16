import { z } from "zod";
import {
  Noid,
  Slug,
} from "@crkn-rcdr/access-data";
import { createRouter, httpErrorToTRPC } from "../router.js";

/* client should:
const fileStream = fs.createReadStream('/path/to/large/file.wav);
fetch('https://example.com/api', {
method: 'POST',
body: {
  slug, // manifest slug
  summary: z.any(), // manifest summary
  label: z.any(), // manifest label
  sequenceNum: 1, // canvas sequence
  data: { // file data
    fileStream,
    size : 1
    width : 1
    height : 1
    md5 : '...'
  }
}
}).then(response => {
// handle response
});
*/
const PutInput = z.object({
  slug: Slug,
  sequenceNum: z.number(),
  summary: z.any(),
  label: z.any(),
  data: z.any()
});
export const manifestEditorRouter = createRouter()
  .mutation("uploadCanvas", {
    input: PutInput,
    async resolve({ input: { slug, sequenceNum, data, label }, ctx }) { // user: User
      try {
        console.log(slug)
        const noid: Noid = await ctx.noid.mintOneOfType("canvas")
        const encodedNoid = encodeURIComponent(noid)
        console.log("created noid", noid)
        const swiftRes = await ctx.swiftClient.accessFiles.create(
          noid,
          data.fileStream
        )
        console.log("uploaded", swiftRes)
        const canvasRes = await ctx.couch.canvas.createCanvas(
          {
            "id": noid,
            "source": {
              "from": "IIIF",
              "url": `https://image-tor.canadiana.ca/iiif/2/${encodedNoid}/info.json`
            },
            "master": {
              "extension": "jp2",
              "size": data.size,
              "width": data.width,
              "md5": data.md5,
              "mime": "image/jpeg",
              "height": data.height
            }
          }
        )
        console.log("created canvas in db", canvasRes)
        let manifest: any = await ctx.couch.access.findUnique(
          "slug",
          slug,
          ["id", "slug"] as const
        )
        if (!manifest) {
          const manifestNoid: Noid = await ctx.noid.mintOneOfType("manifest")
          manifest = {
            id: manifestNoid,
            slug,
            summary: "",
            type: "manifest",
            label,
            canvases: [{
                id: noid,
                label: {
                  "none": `Image ${sequenceNum}`
                }
            }]
          }
          const manifestRes = await ctx.couch.access.createManifest(manifest)
          console.log("create manifest in db", manifestRes)
        } 
        const canvas = {
          "id" : `https://heritage.canadiana.ca/iiif/${slug}/canvas/p${sequenceNum}`,
          "width" : data.width,
          "height" : data.height,
          "items" : [
             {
                "id" : `https://heritage.canadiana.ca/iiif/${slug}/page/p${sequenceNum}/main1`,
                "items" : [
                   {
                      "body" : {
                         "format" : "image/jpeg",
                         "height" : data.height,
                         "id" : `https://image-uab.canadiana.ca/iiif/2/${encodedNoid}/full/max/0/default.jpg`,
                         "service" : [
                            {
                               "id" : `https://image-uab.canadiana.ca/iiif/2/${encodedNoid}`,
                               "profile" : "level2",
                               "type" : "ImageService2"
                            }
                         ],
                         "type" : "Image",
                         "width" : data.width
                      },
                      "id" : `https://heritage.canadiana.ca/iiif/${slug}/annotation/p${sequenceNum}/image`,
                      "motivation" : "painting",
                      "target" : `https://heritage.canadiana.ca/iiif/${slug}/canvas/p${sequenceNum}`,
                      "type" : "Annotation"
                   }
                ],
                "type" : "AnnotationPage"
             }
          ],
          "label" : {
             "none" : [
                "Image 3"
             ]
          },
          "thumbnail" : [
             {
                "format" : "image/jpeg",
                "id" : `https://image-uab.canadiana.ca/iiif/2/${encodedNoid}/full/max/0/default.jpg`,
                "type" : "Image"
             }
          ],
          "type" : "Canvas"
        }
        return { canvas, manifest }
      } catch (e: any) {
        console.log(e?.message)
        throw httpErrorToTRPC(e)
      }
    },
  });
