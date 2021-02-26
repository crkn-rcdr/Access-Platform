# Notes for the access/canvas schemas

## Access

- \_id: a noid, which should satisfy `/^69429\\/[acms][0-9]+[0-9bcdfghjkmnpqrstvwxz]{2}[0-9][0-9bcdfghjkmnpqrstvwxz]{2}[0-9][0-9bcdfghjkmnpqrstvwxz]{2}[0-9][0-9bcdfghjkmnpqrstvwxz]$/`
- type: collection | manifest | alias | canvas (note: type does not get applied to canvas documents, since they are found in a separate database)
- public: if it exists, it's a date (TODO: consider this some more)
- updateInternalmeta: update object

## Slugged extends Access

- slug: A human-readable identifier

## Canonical extends Slugged

- label: text field
- summary: text field
- dmdType: dc | issueinfo | marc

## Collection extends Canonical

- type: collection
- behavior: unordered | individuals | multi-part (unordered for our unordered collections, multi-part for our ordered collections, to start)
- members
  - id
  - label: text field, optional

## Manifest extends Canonical

- type: manifest
- of: canvases | pdf
- behavior: individuals | continuous | paged (continuous by default, for now)
- viewingDirection: left-to-right | right-to-left | top-to-bottom | bottom-to-top (left-to-right by default)

### CanvasManifest extends Manifest

- of: canvases
- canvases
  - id
  - label
- ocrPdf
  - path
  - size

### PdfManifest extends Manifest

- of: pdf
- file
  - path
  - size
- pageLabels

## Alias extends Slugged

- type: alias
- to: id

## Canvas extends Access

- source
- file (TODO: change from current "master")
- orphan
- ocrPdf (TODO: combine with "ocrText" into ocr.pdf, ocr.text?)
- ocrText

## A note on IIIF text values

Our current databases support fully "array-ified" IIIF text objects, of the form `{ "lang": ["value1", "value2"] }`. For text fields in these databases, the likelihood of requiring more than one string per language is remote, and as such we should store values for these fields in the form `{ "lang": "value" }`.
