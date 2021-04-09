const { validator } = require("..");
const { validate } = require("@crkn-rcdr/access-data").couch.access;

module.exports = validator(validate);
