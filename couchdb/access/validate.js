const validator = require("../validator");
const { validate } = require("@crkn-rcdr/access-data").couch.access;

module.exports = validator(validate);
