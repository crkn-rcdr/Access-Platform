// Used by https://github.com/crkn-rcdr/cap/blob/main/CAP/lib/CAP/Model/Parl.pm
module.exports = {
  map: function (doc) {
    if (
      "parlLabel" in doc &&
      "parlNode" in doc &&
      Array.isArray(doc.parlNode)
    ) {
      doc.parlNode.forEach(function (node) {
        emit(node, doc.parlLabel);
      });
    }
  },
  reduce: "_count",
};
