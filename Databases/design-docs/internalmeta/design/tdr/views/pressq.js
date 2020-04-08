module.exports = {
  map: function(doc) {
    // Flag to set if Press should output or delete documents
    var pressme = true;

    // Delete if AIP has been copied to less than 4 repositories
    if (!("repos" in doc) || doc.repos.length < 4) {
      pressme = false;
    }

    // Grab the date Press last ran (if at all)
    var pressdate = "";
    if ("press" in doc && "date" in doc.press) {
      pressdate = doc.press.date;
    }

    var queuedate = undefined;
    // We want to be able to find the oldest of the dates we find that
    // are more recent than the last time Press ran
    function uqd(testdate) {
      if (testdate > pressdate) {
        if (queuedate == undefined || testdate < queuedate) {
          queuedate = testdate;
        }
      }
    }

    // Look in attachments for updates
    if ("attachInfo" in doc) {
      if ("hammer.json" in doc.attachInfo) {
        // If any of the attachment dates are newer
        Object.keys(doc.attachInfo).forEach(function(file) {
          if ("uploadDate" in doc.attachInfo[file]) {
            uqd(doc.attachInfo[file].uploadDate);
          }
        });
      } else {
        // Delete if hammer.json missing
        pressme = false;
      }
    } else {
      // Delete if no attachments
      pressme = false;
    }

    // Collections updated
    if ("collectionDate" in doc) {
      uqd(doc.collectionDate);
    }
    // Repositories updated
    if ("reposDate" in doc) {
      uqd(doc.reposDate);
    }
    // Approved updated
    if ("approved" in doc) {
      uqd(doc.approved);
    } else {
      // Delete if not approved
      pressme = false;
    }

    // Unaproved updated
    if ("unapproved" in doc) {
      uqd(doc.unapproved);
      // Delete if unapproved
      pressme = false;
    }

    // An update was requested
    if ("updatereq" in doc) {
      uqd(doc.updatereq);
    }

    // If queuedate set then at least one date was newer than the last
    // time Press ran
    if (queuedate != undefined) emit(queuedate, pressme);
  },
  reduce: "_count"
};
