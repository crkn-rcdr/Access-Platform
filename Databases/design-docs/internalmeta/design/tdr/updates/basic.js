module.exports = function(doc, req) {
  var nowdate = new Date();
  // Javascript toISOString() includes parts of a second, which we strip.
  var nowdates = nowdate.toISOString().replace(/\..*Z/, "Z");
  var updated = false;
  if ("form" in req) {
    var updatedoc = req.form;

    if (!doc) {
      if ("id" in req && req["id"]) {
        if ("nocreate" in updatedoc) {
          return [null, '{"return": "no create"}\n'];
        } else {
          // create new document
          doc = {};
          doc["_id"] = req["id"];
          doc["created"] = nowdates;
          updated = true;
        }
      } else {
        // change nothing in database
        return [null, '{"error": "Missing ID"}\n'];
      }
    }
    if ("repos" in updatedoc) {
      // This parameter sent as JSON encoded string
      var repos = JSON.parse(updatedoc["repos"]);

      // Equality is same membership, even if different order
      function hasSameMembers(repo1, repo2) {
        if (!repo1 || !repo2 || repo1.length != repo2.length) {
          return false;
        }
        // TODO: cheating for now - treat same if length same
        return true;
      }
      if (
        !("reposManifestDate" in doc) ||
        !hasSameMembers(doc["repos"], repos)
      ) {
        doc["repos"] = repos;
        doc["type"] = "aip";
        // Remove old key -- remove this once database transitioned
        delete doc["public_repo"];
        doc["reposManifestDate"] = updatedoc["manifestdate"];
        doc["reposDate"] = nowdates;
        updated = true;
      }
    }
    if ("METS" in updatedoc) {
      // This parameter sent as JSON encoded string
      doc["METS"] = JSON.parse(updatedoc["METS"]);
      doc["METSManifestDate"] = updatedoc["manifestdate"];
      doc["METSDate"] = nowdates;
      updated = true;
    }
    if ("type" in updatedoc && doc["type"] !== updatedoc["type"]) {
      doc["type"] = updatedoc["type"];
      updated = true;
    }
    if ("sub-type" in updatedoc && doc["sub-type"] !== updatedoc["sub-type"]) {
      doc["sub-type"] = updatedoc["sub-type"];
      updated = true;
    }
    if ("parent" in updatedoc && doc["parent"] !== updatedoc["parent"]) {
      doc["parent"] = updatedoc["parent"];
      updated = true;
    }
    if ("pageinfo" in updatedoc) {
      // This parameter sent as JSON encoded string
      var pageinfo = JSON.parse(updatedoc["pageinfo"]);

      doc["pageinfo"] = pageinfo;
      updated = true;
    }
    if ("approved" in updatedoc) {
      if (updatedoc["approved"] === "false") {
        if ("approved" in doc) {
          delete doc["approved"];
          doc["unapproved"] = nowdates;
          updated = true;
        }
      } else {
        if (!("approved" in doc)) {
          delete doc["unapproved"];
          doc["approved"] = nowdates;
          updated = true;
        }
      }
    }
    if ("upload" in updatedoc) {
      var uploadinfo = {};
      if ("uploadinfo" in updatedoc) {
        // This parameter sent as JSON encoded string
        var uploadinfo = JSON.parse(updatedoc["uploadinfo"]);
      }
      uploadinfo["uploadDate"] = nowdates;

      var attachinfo = {};
      if ("attachInfo" in doc) {
        attachinfo = doc["attachInfo"];
      }
      attachinfo[updatedoc["upload"]] = uploadinfo;

      doc["attachInfo"] = attachinfo;
      updated = true;
    }
    if ("collectionsadd" in updatedoc) {
      var col = [];
      if ("collections" in doc) {
        col = doc["collections"];
      }

      var cola = updatedoc["collectionsadd"].split(",");
      for (var i = 0, l = cola.length; i < l; i++)
        if (col.indexOf(cola[i]) === -1 && cola[i] !== "") col.push(cola[i]);
      doc["collections"] = col;
      doc["collectionDate"] = nowdates;
      updated = true;
    }
    if ("collectionssub" in updatedoc) {
      var col = [];
      if ("collections" in doc) {
        col = doc["collections"];
      }

      var cols = updatedoc["collectionssub"].split(",");
      var colnew = [];
      for (var i = 0, l = col.length; i < l; i++)
        if (cols.indexOf(col[i]) === -1) colnew.push(col[i]);
      doc["collections"] = colnew;
      doc["collectionDate"] = nowdates;
      updated = true;
    }
    if ("press" in updatedoc) {
      var press = JSON.parse(updatedoc["press"]);
      if (!("date" in press)) {
        press["date"] = nowdates;
      }
      doc["press"] = press;
      updated = true;
    }
    if ("hammer" in updatedoc) {
      var hammer = JSON.parse(updatedoc["hammer"]);
      if (!("date" in hammer)) {
        hammer["date"] = nowdates;
      }
      doc["hammer"] = hammer;
      updated = true;
    }
    if ("update" in updatedoc) {
      doc["updatereq"] = nowdates;
      updated = true;
    }
    if ("hammerretry" in updatedoc) {
      if ("hammer" in doc && "manifestdate" in doc.hammer) {
        delete doc.hammer["manifestdate"];
        updated = true;
      }
    }
    if ("label" in updatedoc && doc["label"] !== updatedoc["label"]) {
      doc["label"] = updatedoc["label"];
      updated = true;
    }
    if ("pubmin" in updatedoc && doc["pubmin"] !== updatedoc["pubmin"]) {
      doc["pubmin"] = updatedoc["pubmin"];
      updated = true;
    }
    if ("seq" in updatedoc && doc["seq"] !== updatedoc["seq"]) {
      doc["seq"] = updatedoc["seq"];
      updated = true;
    }
    if ("canonicalDownload" in updatedoc) {
      doc["canonicalDownload"] = updatedoc["canonicalDownload"];
      updated = true;
    }
    if ("hammerfields" in updatedoc) {
      // This parameter sent as JSON encoded string
      var hammerfields = JSON.parse(updatedoc["hammerfields"]);

      doc["hammerfields"] = hammerfields;
      updated = true;
    }
  }
  var retval = {};
  if ("reposManifestDate" in doc) {
    retval["METSmatch"] =
      "METSManifestDate" in doc &&
      doc.reposManifestDate === doc.METSManifestDate;
  }
  if (updated) {
    doc["updated"] = nowdates;
    retval["return"] = "update";
    return [doc, JSON.stringify(retval) + "\n"];
  } else {
    retval["return"] = "no update";
    return [null, JSON.stringify(retval) + "\n"];
  }
};
