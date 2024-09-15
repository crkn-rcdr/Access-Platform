module.exports = {
    map: function (doc) {
        if("dmdtype" in doc &&  doc.dmdType === "marc") emit(doc._id, null);
    },
};
  