module.exports = {
    map: function (doc) {
        if("dmdtype" in doc &&  doc.dmdType === "issueinfo") emit(doc._id, null);
    },
};
  