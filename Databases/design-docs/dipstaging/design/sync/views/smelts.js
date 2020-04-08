module.exports = {
    map: function(doc) {
      if ("smelt" in doc && "processDate" in doc["smelt"]) {
        emit(
          [doc.smelt.succeeded, doc.smelt.message !== "", doc.smelt.processDate],
          null
        );
      }
    },
    reduce: "_count"
  };