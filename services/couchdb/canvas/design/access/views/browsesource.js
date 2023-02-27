module.exports = {
  map: function (doc) {
    if ("source" in doc && "from" in doc.source) {
      var keys = [doc.source.from];

      if (doc.source.from === "cihm" && "path" in doc.source) {
        var replaced = doc.source.path.replace("/data/sip/data/files", "");
        var arraysource = replaced.split(new RegExp("[/_.]"));
        arraysource.pop();
        keys.push(...arraysource);
      }

      emit(keys, null);
    } else {
      emit("none", null);
    }
  },
  reduce: "_count",
};
