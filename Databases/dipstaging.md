
## _update/basic fields

Some fields are automatically filled in when the tool 'reposync' (Part of [CIHM::META](https://github.com/crkn-rcdr/CIHM-Meta) ) posts data to dipstaging's [_update/basic](https://github.com/crkn-rcdr/cihm-metadatabus/blob/master/couchdb/dipstaging/design/sync/updates/basic.js).

* deposits - empty array created when document first created

* repos - array of repositories which has this AIP
* reposManifestDate - date on the AIP manifest.  Used to detect when the AIP has been updated, so this date should be stored with any processing.
* reposDate - the date when the above two field were filled in.

* METS - array of hashes indicating the 'path' and 'md5' of every metadata.xml file within the AIP
* METSManifestDate - date on the AIP manifest when this field was filled in
* METSDate - the date when the above two field were filled in.

* updated - date of when this document was last updated

