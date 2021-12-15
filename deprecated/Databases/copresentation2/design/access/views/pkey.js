module.exports = {
  map: function (doc) {
    if ("pkey" in doc) {
      emit(doc.pkey, null);
    }
  },
};
