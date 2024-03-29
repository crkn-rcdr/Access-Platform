module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    updateObject,
    timestamp
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

    const itypes = [
      "add",
      "addBefore",
      "addAfter",
      "remove",
      "move",
      "relabel",
      "moveBefore",
      "moveAfter",
      "prepend",
      "overwrite",
    ];
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
        throw new Error("`append` expects a list of ids");
      }

      input.forEach((id) => {
        const entry = { id: id };
        if (doc.type === "manifest") {
          entry.label = { none: "Image " + (list.length + 1) };
        }
        list.push(entry);
      });
    } else if (command === "prepend") {
      if (!Array.isArray(input)) {
        throw new Error("`prepend` expects a list of ids");
      }

      for (let i = input.length - 1; i >= 0; i--) {
        const id = input[i];
        const entry = { id: id };
        if (doc.type === "manifest") {
          entry.label = { none: "Image " + (list.length + 1) };
        }
        list.unshift(entry);
      }
    } else if (command === "addAfter" || command === "addBefore") {
      if (!Array.isArray(input) || input.length !== 2) {
        throw new Error(
          `${command} expects a list with a list of ids and a reference slug`
        );
      }

      const [ids, refMember] = input;

      if (!Array.isArray(ids)) throw new Error("`move` expects a list of ids");

      let refIndex = findIndex(refMember);
      if (!Number.isInteger(refIndex) || refIndex < 0) {
        throw new Error("invalid slug specified for `add`: " + refMember);
      }

      let index = command === "addAfter" ? refIndex + 1 : refIndex - 1;

      if (index < 0) index = 0;
      else if (index > doc.members.length) index = doc.members.length;

      let newMembers = ids.map((id) => {
        return { id };
      });

      list.splice(index, 0, ...newMembers);
    } else if (command === "overwrite") {
      if (!Array.isArray(input)) {
        throw new Error("`overwrite` expects a list of ids");
      }

      const newList = [];

      input.forEach((id) => {
        const entry = { id: id };
        if (doc.type === "manifest") {
          entry.label = { none: "Image " + (list.length + 1) };
        }
        newList.push(entry);
      });

      list = newList;
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
        throw new Error(
          "`move` expects a list with a list of ids and an index"
        );
      }

      const [ids, toIndex] = input;

      if (!Array.isArray(ids)) throw new Error("`move` expects a list of ids");

      if (!Number.isInteger(toIndex) || toIndex < 0 || toIndex >= list.length) {
        throw new Error("invalid toIndex specified for `move`: " + toIndex);
      }

      let newIndex = toIndex;
      for (const id of ids) {
        const fromIndex = findIndex(id);
        if (fromIndex > -1) {
          list.splice(newIndex, 0, list.splice(fromIndex, 1)[0]);
          newIndex += 1;
        }
      }
    } else if (command === "moveAfter" || command === "moveBefore") {
      if (!Array.isArray(input) || input.length !== 2) {
        throw new Error(
          `${command} expects a list with a list of ids and a reference slug`
        );
      }

      const [ids, refMember] = input;

      if (!Array.isArray(ids)) throw new Error("`move` expects a list of ids");

      let refIndex = findIndex(refMember);
      if (!Number.isInteger(refIndex) || refIndex < 0) {
        throw new Error("invalid slug specified for `move`: " + refMember);
      }

      let newIndex = command === "moveAfter" ? refIndex + 1 : refIndex - 1;

      if (newIndex < 0) newIndex = 0;
      else if (newIndex >= doc.members.length)
        newIndex = doc.members.length - 1;

      for (const id of ids) {
        const fromIndex = findIndex(id);
        if (fromIndex > -1) {
          list.splice(newIndex, 0, list.splice(fromIndex, 1)[0]);
          newIndex += 1;
        }
      }
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
      if (input.command[0] !== "relabel") {
        const now = timestamp();
        doc.createOCRPDF = { requestDate: now };
      }
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
