# Access Objects

One of the purposes of the preservation-access split is to allow for an abstract, conceptual layer for the objects being described and viewed using our public interfaces. A preservation object is created when a digital representation of a physical thing is ingested; an access object is created when an entry is added to a catalogue. If the conceptual "library" layer, the one primarily interacted with by the public, serves most needs, a concrete "archive" layer is needed underneath to serve the rest (largely, permanence). The abstract layer can be thought of as a pointer to the concrete layer:

```
 'abstract'              'concrete'
              ------->
oocihm.00001               nq48c5
```

In the event a concrete object needs to be replaced, the abstract pointer can change targets:

```
 'abstract'              'concrete'
              ------->
oocihm.00001               fg98q7
                             /\
                             || supersededBy
                             ||
                           nq48c5
```

This abstract layer is referenceable by what I would verbosely like to call a 'discovery identifier' but which we'll just call a 'slug'. All current identifiers on our access platform are, in reality, slugs. The concrete layer is referenced through opaque identifiers; for users seeking a permanent reference (e.g. for citation) this is what will be safest to use.

**Policy questions**: in the browser, should slugs resolve to their concrete identifiers, or should those be saved for 'permanent link' references? If we primarily use slugs, how should the URL scheme for concrete references work?

## First-order objects

We have three first-order objects to consider, for which we will use the IIIF nomenclature:

- The canvas: the representation of a two-dimensional space
  - Discovery: the canvas can be discovered through with a combination of a manifest's slug and the canvas's sequence, e.g. `oocihm.00001/4`
  - Immutability: a canvas cannot point to a new digital representation of a physical object. However, it can point to a new format of an existing digital representation (e.g. a higher-fidelity copy of the preserved image)
- The manifest: an ordered list of canvases
  - Discovery: the manifest can be discovered through its slug
  - Immutability: a published manifest's canvas contents or order cannot change. If a published manifest is to be corrected, a new manifest is created, and the original manifest's slug references the new one. We will need to fashion a mechanism to point corrected manifests to the ones they have been superseded by.
- The collection: an ordered or unordered list of collections and manifests
  - Discovery: the collection can be discovered through its slug, or from a member collection/manifest
  - Immutability: collections have no immutability constraints. Membership is variable, and members should not be accessible by the collection's slug and the member's sequence. Technically speaking, collections may not need opaque identifiers.

## Associated data

### Files

Canvases must have an image file (more accurately, a pointer to an image service) associated with it. Changing this file will likely trigger the creation of a new canvas, and the nature of the change may determine whether canvas metadata is copied over. Canvases may also have an OCR-generated PDF and/or ALTO XML file associated with them.

Manifests may have PDFs associated with them. For manifests of scanned content, this process is derivative and should not violate immutability constraints. For born-digital content, these PDFs come directly from the source. We may want to distinguish between the two kinds of PDFs with a naming convention.

Collections have no files associated with them.

### Descriptive metadata

Canvases do not have associated descriptive metadata.

Manifests and 'series' collections have associated descriptive metadata, which currently comes from three possible METS sources (MARC, DC, issueInfo), and one format for superseding METS data (parl). A normalization procedure takes place to generate a public metadata record (quasi-CMR). Direct linking to MARC records is a desired feature. Future policies will be put in place to ensure that this descriptive metadata is derived from a single source. Directly editing metadata that has been crosswalked to a public record in a lossy fashion will not be allowed.

Non-series collections (i.e. the ones 'tagging' manifests and series collections) have their own descriptive metadata concerns which need fleshing out.

### Transcriptions

Canvases are transcribed by OCR. Someday we'd like to support human transcriptions as well. OCR can be re-run on the source scan for a particular canvas; this will replace the OCR output in-place and will have no effect on the canvas' immutability.

Manifest transcriptions are simply collations of the manifests' members transcriptions.

### Commentary

Some canvases from the Heritage project have been tagged by a third-party source. These tags are collated into the canvases' manifest.
