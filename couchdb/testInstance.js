const kivik = require("kivik");

let instance;

module.exports = async () => {
  if (!instance) {
    instance = await kivik.getInstance(".");
  }
  return instance;
};
