module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    updateObject,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const input = extractJSONFromBody(req);
  if (!input) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const processList = (list, instruction) => {
    const findIndex = (id) => list.findIndex((entry) => entry.id === id);

    const itypes = ["add", "remove", "move", "relabel"];
    if (
      !Array.isArray(instruction) ||
      instruction.length !== 2 ||
      !itypes.includes(instruction[0])
    ) {
      throw new Error("Cannot process instruction");
    }

    const [command, input] = instruction;

    if (!Array.isArray(list)) {
      throw new Error("Array not provided");
    }

    if (command === "add") {
      if (!Array.isArray(input)) {
        throw new Error("`add` expects a list of ids");
      }

      input.forEach((id) => {
        const entry = { id: id };
        if (doc.type === "manifest") {
          entry.label = { none: "Image " + (list.length + 1) };
        }
        list.push(entry);
      });
    } else if (command === "remove") {
      if (!Array.isArray(input)) {
        throw new Error("`remove` expects a list of ids");
      }

      input.forEach((id) => {
        const removedIndex = findIndex(id);
        if (removedIndex > -1) list.splice(removedIndex, 1);
      });
    } else if (command === "move") {
      if (!Array.isArray(input) || input.length !== 2) {
        throw new Error("`move` expects a list with two indices");
      }

      const [fromIndex, toIndex] = input;
      if (
        !Number.isInteger(fromIndex) ||
        fromIndex < 0 ||
        fromIndex >= list.length
      ) {
        throw new Error("invalid fromIndex specified for `move`: " + fromIndex);
      }

      if (!Number.isInteger(toIndex) || toIndex < 0 || toIndex >= list.length) {
        throw new Error("invalid toIndex specified for `move`: " + toIndex);
      }

      list.splice(toIndex, 0, list.splice(fromIndex, 1)[0]);
    } else if (command === "relabel") {
      if (!Array.isArray(input) || input.length !== 2) {
        throw new Error(
          "`relabel` expects a list with an id and a label object"
        );
      }

      const [id, label] = input;
      if (typeof label !== "object" || Object.keys(label).length < 1) {
        throw new Error("invalid label specified for `relabel`");
      }
      const index = findIndex(id);

      if (index > -1) {
        list[index].label = label;
      }
    }

    return list;
  };

  try {
    if (doc.type === "manifest") {
      doc.canvases = processList(doc.canvases, input.command);
    } else if (doc.type === "collection") {
      doc.members = processList(doc.members, input.command);
    }
    updateObject(doc, input.user);
  } catch (e) {
    return errorReturn(e.message);
  }

  return successReturn(
    doc,
    `${doc.slug ? doc.slug : doc.id} has had its canvases updated`
  );
};
