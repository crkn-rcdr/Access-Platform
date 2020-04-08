module.exports = {
    map: function(doc) {
      if ("smelt" in doc && "requestDate" in doc["smelt"]) {
        if (
          "processDate" in doc["smelt"] &&
          doc["smelt"]["processDate"] >= doc["smelt"]["requestDate"]
        ) {
          return;
        }
        emit(doc["smelt"]["requestDate"],null);
      }
    },
    reduce: "_count"
  };