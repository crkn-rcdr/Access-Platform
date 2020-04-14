module.exports = {
  map: function(doc) {
    emit(
      [
        "approved" in doc ? "approved" : "not approved",
        doc["type"],
        doc["sub-type"],
        "collections" in doc ? doc["collections"].length : 0
      ],
      null
    );
  },
  reduce: "_count"
};
