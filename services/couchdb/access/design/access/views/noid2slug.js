module.exports = {
  map: function (doc) {
    emit(doc._id, doc.slug);
  },
};
