module.exports = {
  map: function(doc) {
      if (("_attachments" in doc) &&
	  ("jhove.xml" in doc["_attachments"])) {
	  emit(null,null);
      }
  },
  reduce: "_count"
};
