module.exports = {
    map: function (doc) {
        if("dmdtype" in doc &&  doc.dmdType === "dc") emit(doc._id, null);
    },
};
  