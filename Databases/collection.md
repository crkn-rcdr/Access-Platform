# collection documents

One of the sources of data are similar to what was previously in 'internalmeta' for "series" documents, including data that was in hammer.json array index 0.
Notes in [manifest.md](manifest.md) apply to those documents filled in from METS records, which might be a one-time operation for this database.


# fields to be stored within couch documents

* dmd - hash of fields extracted from stored descriptive metadata, previously components stored as array index 0 of the hammer.json attachment. These are extracted from a temporarily generated "CMR" XML using [hammer2co.xsl](https://github.com/crkn-rcdr/CIHM-METS-parse/blob/master/lib/CIHM/METS/resource/xsl/hammer2co.xsl).  Common fields include:
  * identifier - array if identifiers
  * label - label from descriptive metadata
  * lang - array of languages
  * no - array of notes
  * no_source - array of notes indicating source
  * pubmin - minimum date in date range (first date for DC, MARC 260c)
  * pubmax - maximum date in date range (second date for DC, MARC 260c)
* collectionDate - date when the list of collections was modified (used by Press)
* collections - array of collections
* created - date document was created
* hammer - hash of fields used by Hammer to know when to run, and to report on success/failure
  * message - message from Hammer (die/warn)
  * dmddate - date of processed descriptive metadata
  * status - boolean for success/failure of Hammer (Did it "die")
  * date when hammer ran
* label - label from METS, most often extracted from descriptive metadata when METS record created
* approved - date when collection made public (unset means staff only)?
* press - hash of fields used by Press to know when to run, and report on success/failure
  * status - boolean for success/failure
  * messsage - die/warn messages
  * date - date when Press run, used in comparing other dates to know when to next run
* updated - date of last update
* updatereq - date when a press update was requested (used as part of press handling of re-processing parent records)

