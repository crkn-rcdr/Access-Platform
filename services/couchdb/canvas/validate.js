const { Canvas } = require("@crkn-rcdr/access-data");

module.exports = (data) => {
  data["id"] = data["_id"];
  data["type"] = "canvas";
  const test = Canvas.safeParse(data);
  if (test.success) {
    return true;
  } else {
    // setting this up until crkn-rcdr/kivik#72 is sorted out
    console.log(test.error.errors);
    return { valid: false, errors: test.error.errors };
  }
};
