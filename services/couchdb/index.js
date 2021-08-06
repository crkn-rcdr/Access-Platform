const { writeJson } = require("fs-extra");
const { join: pathJoin } = require("path");
const { get: getNano } = require("@crkn-rcdr/nano");

module.exports.validator = (schema) => (data) => {
  const valid = schema.safeParse(data);
  if (valid.success) {
    return true;
  } else {
    return { valid: false, errors: valid.error.errors };
  }
};

module.exports.pullFixtures = async () => {
  const {
    deployments: {
      iris: {
        url,
        auth: { user, password },
      },
    },
  } = require("./kivikrc.json");

  const client = getNano(url, { user, password });

  const queue = ["oocihm.8_06941"];

  while (queue.length > 0) {
    const item = queue.shift();
    let db = "access";
    let rows = [];

    if (typeof item === "string") {
      const response = await client.use(db).find({
        selector: { slug: { $eq: item } },
      });
      rows = response.docs.map((doc) => {
        return { id: doc._id, doc };
      });
    } else if (Array.isArray(item)) {
      db = item[0];
      rows = (await client.use(db).fetch({ keys: item[1] })).rows;
    } else {
      throw new TypeError(
        `What happened here? ${JSON.stringify(item, null, 2)}`
      );
    }

    for await (const row of rows) {
      const { id, doc } = row;

      await writeJson(
        pathJoin(__dirname, db, "fixtures", id.replace("/", "_") + ".json"),
        doc,
        { spaces: 2 }
      );

      if (doc.type === "collection") {
        queue.push(["access", doc.members.map((obj) => obj.id)]);
      } else if (doc.type === "manifest" && doc.from === "canvases") {
        queue.push(["canvas", doc.canvases.map((obj) => obj.id)]);
      }
    }
  }
};
