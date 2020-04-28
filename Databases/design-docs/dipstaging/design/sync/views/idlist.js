module.exports = {
  map: function (doc) {
    var idsp = doc._id.split(".");
    var dep = idsp[0];
    var objid = idsp[1];
    var nextchar = objid.charAt(0);
    if (dep === "oocihm" && objid.indexOf("lac_reel") === 0) {
      dep = "oocihm.lac_reel";
      nextchar = objid.charAt(9);
    } else if (dep === "oocihm" && objid.indexOf("lac_mikan") === 0) {
      dep = "oocihm.lac_mikan";
      nextchar = objid.charAt(10);
    }
    emit([dep, nextchar], null);
  },
  reduce: "_count",
};
