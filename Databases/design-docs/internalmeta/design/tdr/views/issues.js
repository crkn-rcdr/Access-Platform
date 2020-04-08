module.exports = {
  map: function(doc) {
    // Only processing issues of series
    if (!("parent" in doc)) {
      return;
    }
    var seq = 0;
    if ("seq" in doc) {
      seq = parseInt(doc.seq);
    }
    if (seq <= 9999) {
      seq = ("000" + seq).slice(-4);
    }
    emit([doc.parent, seq], {
      label: doc["label"],
      pubmin: doc["pubmin"],
      approved: "approved" in doc
    });
  },
  reduce: "_count"
};
