# Access Platform Glossary

If you have any questions or comments, please [submit an issue](https://github.com/crkn-rcdr/Access-Platform/issues/new), or contact Sascha directly.

The access platformʼs data model is based on the model defined by the [IIIF Presentation API](https://iiif.io/api/presentation/3.0/). This allows access platform objects to be transformed into IIIF resources in a straightforward manner.

## Access Object

[Collections](#Collection), [manifests](#Manifest), and [canvases](#Canvas) are access objects; these are the objects that form the building blocks of the access platform. Our [admin tools](https://admin.canadiana.ca/) allow for the creation and manipulation of these objects.

## “Basic” Metadata

Metadata about a [collection](#Collection), [manifest](#Manifest), or [canvas](#Canvas) that is directly editable within the admin tools, as opposed to metadata imported from elsewhere. An [access objectʼs](#Access-Object) basic metadata can include its [ID](#ID), [slug](#Slug), label, URLs to other resources associated with it, and information about its contents. Depending on the type of access object, some kinds of basic metadata are required, and other kinds are optional.

## Canvas

A canvas is a virtual representation of the space occupied by an image. Canvases are defined by a width and height, and can be annotated by images and text. When an image is imported from preservation, a canvas is created with the imageʼs dimensions, with the original image painted on the canvas as an annotation. In the future, text (e.g. OCR, transcriptions) can also be added as annotations; this enables features like search-term highlighting. Associating annotations with a canvas instead of an image means that annotations wonʼt be lost if the process for generating the underlying image changes; IIIF canvases also support being painted by multiple image annotations, something we might want to support in the future.

Canvases are imported into the access platform as part of a manifest. They and their annotations can be added to any number of manifest. Canvases can only be found through the manifests that contain them. Any canvases that arenʼt part of a manifest are effectively lost and subject to deletion.

If the image of a canvas violates copyright or someoneʼs privacy, it can be [taken down](#Takedown).

## Collection

Collections are groupings of other collections and [manifests](#Manifest). Collections are currently used for multiple purposes:

- determining what content is available on a [**portal**](#Portal)
- gathering content related to a theme or digitization project (a.k.a. **thematic collection**, **subcollection**)
- representing the record of a newspaper, magazine, or other serial publication (a.k.a. **series record**)

The collections and manifests grouped together by a collection form its [members list](#Membership-and-Descent). Since collections can be members of other collections, collections and manifests can [descend](#Membership-and-Descent) from collections without being their direct members.

[Discovery](#Discovery) on the access platform can be limited to the descendents of a particular collection; this is what makes a given manifest show up on one portal and not another.

Collections can either be _ordered_ or _unordered_, depending on whether the order of the collectionʼs member list has meaning.

Since collections do not contain any preserved image content, collection records are no longer part of the preservation platform. Collections are created and their member lists edited solely within the access platform. In addition, the collection record defines what its members are and what order theyʼre in. For series records, each individual issue no longer needs to know what sequence number it has. Similarly, individual issues can be members of multiple collections.

## Descriptive Metadata

[Collections](#Collection) and [manifests](#Manifest) can be described by Descriptive Metadata (DMD), in addition to their [basic metadata](#Basic-Metadata). DMD is indexed in the search engine that patrons use to discover Canadiana content, and records are normalized and displayed to the public. The access platform accepts the following types of records:

- `DC` (Dublin Core), in CSV format, for Collections and Manifests
- `MARC`, in XML format, for Collections and Manifests
- `IssueInfo`, in CSV format, for Manifests (deprecated)

Collections and manifests can only be described by one descriptive metadata record; any update to a record overwrites the previous one.

Importing a manifest from preservation will also import any descriptive metadata that has been ingested with the preservation AIP. Any subsequent **metadata updates** to collections or manifests can only take place using the access platformʼs tools.

### DMD Task

After a new set of records is uploaded, the records are processed in the background asynchronously. A DMD task record is generated to provide staff with a report on progress, and to allow staff to approve the recordsʼ normalization before they are published.

## Discovery

Searching for and viewing content.

## ID

[Access Objects](#Access-Object) are assigned opaque identifiers for internal and machine use. IDs are designed to be resolvable by third-party services, and as such they all take the form `69429/$NOID`, where `69429` is CRKNʼs [Name Assigning Authority Number](https://n2t.net/e/pub/naan_registry.txt) and `$NOID` is a unique identifier generated by our [noid service](https://github.com/crkn-rcdr/noid). In the future, these IDs will form the basis of a robust permanent linking feature for [manifests](#Manifest).

## Label

Labels are short [text values](#Text-Values) that are used to reference [access objects](#Access-Objects), often as titles or headings. Labels are used in the following settings:

- [Collection](#Collection): the collectionʼs title when viewing the collection or finding it in search results
- [Manifest](#Manifest): the manifestʼs title when viewing the manifest or finding it in search results
- [Collection member](#Membership-and-Descent): the memberʼs title when viewing it in its collectionʼs member list (e.g. `Vol. X, Iss. 3`, when the manifestʼs label is `Magazine Name, Vol. X, Iss. 3`)
- [Canvas of a manifest](#Canvas): the name or number of the canvas when viewed in this manifest (e.g. `p. 143`, `title page`, `Image 2`)

Because labels are text values, [they can be specified in multiple languages](#Text-Values).

## Manifest

A manifest represents any sort of work with a series of pages; a **book**, a magazine **issue**, a **reel** of microfiche, a photograph and its reverse. Manifests are used to represent both **monographs** and **issues**, which are functionally identical. Manifests have a list of [canvases](#Canvas) corresponding to the pages of the work.

Manifests can be imported from preservation. Importing a manifest also copies over any [descriptive metadata](#Descriptive-Metadata) in the corresponding AIPʼs METS record. The images of an imported manifest are added to the access platform as canvases, and [OCR](#OCR) files associated with each image are referenced by each canvas record. Manifests can also be created from scratch, and canvases that have been imported into other manifests can be added into them.

Staff can add canvases to manifests, remove canvases from manifests, and change the canvasesʼ order. When correcting images in a manifest, instead of performing a **SIP update** to an existing preservation AIP, staff can ingest an AIP containing only the newly required images, import it into the access platform as a manifest, add the new manifestʼs canvases to the existing manifest, remove the incorrect canvases, and publish the update.

A small number of manifests in the access platform represent born-digital documents as part of the Numeris collection. These manifests will be maintained on the platform but they do not contain canvases in the same manner.

## Membership and Descent

A [manifest](#Manifest) or [collection](#Collection) is a member of a collection if it can be found in its members list.

For example: [Vol. I, No. 8 of the Victoria Home Journal](https://www.canadiana.ca/view/oocihm.8_06942_6) is a member of the [Victoria Home Journal](https://www.canadiana.ca/view/oocihm.8_06942) collection. The Newspapers collection is a member of the Serials collection.

A manifest or collection is a descendent a collection if it is the member of either it or one of its descendents.

For example, [Vol. I, No. 8 of the Victoria Home Journal](https://www.canadiana.ca/view/oocihm.8_06942_6) is a descendent of the Victoria Home Journal, Periodicals, Serials, and Canadiana collections. The Newspapers collection is a descendent of the Serials and Canadiana collections.

All of the descendents of a collection form a sort of “tree” for that collection (the **collection tree**, if you will), with manifests as “leaves” and subcollections as “branches”.

## OCR

Images in our preservation platform are ingested with associated OCR data. In the access platform, references to this data are found in the [canvases](#Canvas) corresponding to these images.

In the future, OCR will be able to be run on access images directly.

## Portal

A [collection](#Collection) can be configured to be a portal; or, to think of it the other way around, a portal is a certain kind of collection. Portals are assigned `canadiana.ca` subdomains (e.g. [`heritage.canadiana.ca`](https://heritage.canadiana.ca)) and patrons can visit sites at these subdomains to [discover](#Discovery) content that [descends from](#Membership-and-Descent) the collection.

## Publishing

When a [collection](#Collection) or [manifest](#Manifest) is ready to be made available to the public, the responsible staff member can do so by clicking on the `Publish` button in the objectʼs editor tool. A public collection or manifest can be unpublished in a similar manner. Unpublishing a collection or manifest does not delete it, and it can be published again at a later time.

## Slug

[Collections](#Collection) and [manifests](#Manifest) have human-readable identifiers known as slugs. A slugʼs main purpose is to identify the URL of a [published](#Publishing) object. For example, [Vol. I, No. 8 of the Victoria Home Journal](https://www.canadiana.ca/view/oocihm.8_06942_6) has the slug `oocihm.8_06942_6`. Slugs are selected by CRKN staff, and no slug can be used by more than one collection or manifest.

Slugs can be any string where each character is one of the following: any kind of letter (e.g. `s`, `É`, `π`, `好`), the digits `0-9`, `_` (underscore), `-` (hyphen/minus sign), or `.` (period). Slugs have a maximum length of 40 characters.

Our legacy platform uses the IDs of imported preservation AIPs as slugs; as such, slugs in the access platform tend to look like `oocihm.xxxxx`, where the preservation depositor and a period precede some kind of internal identifier. Slugs are not restricted to this form; for example, all of our “thematic collections” have simple strings for slugs (e.g. `parl`, `monog`). Staff shouldnʼt feel restricted to keep slugs to this AIP ID form, even for manifests that are derived from preserved content.

In the future, collections and manifests will be able to reserve slugs as aliases to the slug that they currently use. This will allow staff to correct slug typos without having to worry about bookmarks people have already set up that link to existing slugs.

## Takedown

If a [canvas](#Canvas)ʼs image contains content that we cannot display due to privacy concerns or a copyright violation, the canvas can be taken down. Instead of viewing the offending image, patrons will view a generic image explaining that the content is unavailable. It is important to take a canvas down in these cases instead of removing it from its [manifestʼs](Manifest) list of canvases, as the takedown applies to the canvas regardless of what manifest contains it, and the manifestʼs page order can be preserved.

## Text Values

Some [metadata](#Basic-Metadata) fields are human-readable and can be assigned values in one or more languages. This will allow us to present text to our patrons in both English and French, as well as other languages. The language for a text value can be set to `none`, which is the default, or the languageʼs [IETF BCP 47 language tag](https://www.w3.org/International/articles/language-tags/), which is `en` for English, and `fr` for French.
