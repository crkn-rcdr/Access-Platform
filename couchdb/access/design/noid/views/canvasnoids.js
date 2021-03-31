module.exports = {
  map: function (doc) {
    if (Array.isArray(doc.canvases)) {
      for (const canvas of doc.canvases) {
        emit(canvas.id, null);
      }
    }
  },
};
