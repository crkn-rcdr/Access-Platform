module.exports = {
  map: function(doc) {
    if ('canvases' in doc && Array.isArray(doc.canvases)) {
      doc.canvases.forEach(function(thiscanvas) {
        if ('id' in thiscanvas) {
          emit(thiscanvas.id, null);
        }
      });
    }
  }
};
