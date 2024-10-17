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
  slug, // manifest slug -> britt2
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
})

// Temporary - we will move this out into a permanent solution
export const manifestEditorRouter = createRouter()
  .mutation("uploadAndAddNewCanvas", {
    input: PutInput,
    async resolve({ input: { slug, sequenceNum, data, label }, ctx }) { // user: User
        try {
          console.log(slug)
          var noid: Noid = await ctx.noid.mintOneOfType("canvas")
        } catch (e: any) {
          console.log(e?.message)
          throw httpErrorToTRPC(e)
        }
        const encodedNoid = encodeURIComponent(noid)
        console.log("created noid", noid)

        try {
          var swiftRes = await ctx.swiftClient.accessFiles.create(
            noid,
            data.fileStream
          )
        } catch (e: any) {
          console.log(e?.message)
          throw httpErrorToTRPC(e)
        }
      
        console.log("uploaded", swiftRes)
        try {
          var canvasRes = await ctx.couch.canvas.createCanvas(
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
        } catch (e: any) {
          console.log(e?.message)
          //delete swift file
          var deleteSwiftRes = await ctx.swiftClient.accessFiles.delete(noid)
          console.log(deleteSwiftRes)
          throw httpErrorToTRPC(e)
        }
        console.log("created canvas in db", canvasRes)
        var manifest: any = await ctx.couch.access.findUnique(
          "slug",
          slug,
          ["id", "slug"] as const
        )
        if (!manifest) { // This is the first canvas
          try {
            var manifestNoid: Noid = await ctx.noid.mintOneOfType("manifest")
          } catch (e: any) {
            console.log(e?.message)
            //delete swift file
            var deleteSwiftRes = await ctx.swiftClient.accessFiles.delete(noid)
            console.log(deleteSwiftRes)
            //delete canvas
            var deleteCanvasRes = await ctx.couch.canvas.delete({document:noid})
            console.log(deleteCanvasRes)
            throw httpErrorToTRPC(e)
          }
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

          try {
            var manifestRes = await ctx.couch.access.createManifest(manifest)
          } catch (e: any) {
            console.log(e?.message)
            //delete swift file
            var deleteSwiftRes = await ctx.swiftClient.accessFiles.delete(noid)
            console.log(deleteSwiftRes)
            //delete canvas
            var deleteCanvasRes = await ctx.couch.canvas.delete({document:noid})
            console.log(deleteCanvasRes)
            throw httpErrorToTRPC(e)
          }
          console.log("create manifest in db", manifestRes)
        } else { // This is not the first canvas
          try {
            await ctx.couch.access.processList({
              id: manifest.id,
              command: ["add", [noid]],
              user : {
                name : "Manifest Editor",
                email : "blapierre@crkn.ca"
              },
            })
          } catch(e: any) {
            console.log(e?.message)
            //delete swift file
            var deleteSwiftRes = await ctx.swiftClient.accessFiles.delete(noid)
            console.log(deleteSwiftRes)
            //delete canvas
            var deleteCanvasRes = await ctx.couch.canvas.delete({document:noid})
            console.log(deleteCanvasRes)
            throw httpErrorToTRPC(e)
          }
        } 
        var canvas = {
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
      
    },
  });
