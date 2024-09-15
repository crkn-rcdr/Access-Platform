module.exports = {
    map: function (doc) {
        if(!("public" in doc)) emit(doc._id, null);
    },
};
  