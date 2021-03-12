const validator = require("../validator");
const { validate } = require("@crkn-rcdr/access-data").couch.canvas;

module.exports = validator(validate);
