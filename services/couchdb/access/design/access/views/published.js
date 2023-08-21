module.exports = {
    map: function (doc) {
        if("public" in doc && doc.public) emit(doc._id, doc.public);
    },
};
  