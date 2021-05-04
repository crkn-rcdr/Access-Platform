const { validator } = require("..");
const { validateAccessDocument } = require("@crkn-rcdr/access-data");

module.exports = validator(validateAccessDocument);
