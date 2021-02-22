# Notes for the access/canvas schemas

## AccessObject

- \_id: a noid, which should satisfy `/^69429\\/[acms][0-9]+[0-9bcdfghjkmnpqrstvwxz]{2}[0-9][0-9bcdfghjkmnpqrstvwxz]{2}[0-9][0-9bcdfghjkmnpqrstvwxz]{2}[0-9][0-9bcdfghjkmnpqrstvwxz]$/`
- updateInternalmeta: update object

## SluggedObject extends AccessObject

- type: collection | manifest | alias
- slug: see slug definition in glossary
- public: if it exists, it's a date (TODO: consider this some more)

## SpecObject extends SluggedObject

- label: text field
- summary: text field
- dmdType: dc | issueinfo | marc

## Collection extends SpecObject

- type: collection
- behavior: unordered | individuals | multi-part (unordered for our unordered collections, multi-part for our ordered collections, to start)
- members
  - id
  - label: text field, optional

## Manifest extends SpecObject

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

## Alias extends SluggedObject

- type: alias
- to: id

## Canvas extends AccessObject

- source
- file (TODO: change from current "master")
- orphan
- ocrPdf (TODO: combine with "ocrText" into ocr.pdf, ocr.text?)
- ocrText

## A note on IIIF text values

Our current databases support fully "array-ified" IIIF text objects, of the form `{ "lang": ["value1", "value2"] }`. For text fields in these databases, the likelihood of requiring more than one string per language is remote, and as such we should store values for these fields in the form `{ "lang": "value" }`.
