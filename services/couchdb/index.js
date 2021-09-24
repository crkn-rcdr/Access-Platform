const { readJson, writeJson } = require("fs-extra");
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
      production: {
        url,
        auth: { user, password },
      },
    },
  } = await readJson(pathJoin(__dirname, "..", "..", "kivikrc.json"));

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

module.exports.fixStaff = async () => {
  const {
    deployments: {
      production: {
        url,
        auth: { user, password },
      },
    },
  } = await readJson(pathJoin(__dirname, "..", "..", "kivikrc.json"));

  const client = getNano(url, { user, password }).use("access");

  const fetchIds = async () => {
    const response = await client.find({
      selector: {
        $and: [
          {
            staff: {
              $exists: true,
            },
          },
          {
            "staff.by.name": {
              $exists: false,
            },
          },
        ],
      },
      fields: ["_id"],
      limit: 1000,
    });
    return response.docs.map((doc) => doc._id);
  };

  while (true) {
    const ids = await fetchIds();
    console.log(ids);
    for (const id of ids) {
      await client.updateWithHandler("access", "removeStaff", id);
    }
    if (ids.length < 1000) break;
  }
};
