module.exports = {
  map: function (doc) {
    if (!("slug" in doc)) {
      emit(null, null);
    }
  },
};
