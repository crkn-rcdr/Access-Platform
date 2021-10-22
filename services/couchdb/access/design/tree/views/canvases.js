module.exports = {
  map: function (doc) {
    if (Array.isArray(doc.canvases) && doc.canvases.length > 0)
      emit(doc.canvases.length, doc.slug);
  },
  reduce: "_count",
};
