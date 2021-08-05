import {
  AccessObject,
  EditableAlias,
  EditableCollection,
  EditableManifest,
  TextRecord,
  ObjectList,
} from "@crkn-rcdr/access-data";
import equal from "fast-deep-equal";

function checkValidCollection(objectModel: AccessObject) {
  try {
    const res = EditableCollection.parse(objectModel);
    return true;
  } catch (e) {
    return false;
  }
}

function checkValidManifest(objectModel: AccessObject) {
  try {
    const res = EditableManifest.parse(objectModel);
    return true;
  } catch (e) {
    return false;
  }
}

function checkChangeIsValid(objectModel: AccessObject) {
  if (objectModel["type"] === "manifest") {
    return checkValidManifest(objectModel);
  } else if (objectModel["type"] === "collection") {
    return checkValidCollection(objectModel);
  }
}

function checkModelChanged(object: AccessObject, objectModel: AccessObject) {
  return !equal(object, objectModel);
}

function checkValidDiff(object: AccessObject, objectModel: AccessObject) {
  const hasModelChanged = checkModelChanged(object, objectModel);
  if (hasModelChanged) {
    const isModelValid = checkChangeIsValid(objectModel);
    if (isModelValid) return true;
    return false;
  }
  return false;
}

function getSlugValidationMsg(slug: string) {
  try {
    EditableAlias.pick({ slug: true }).parse({ slug });
    return "";
  } catch (e) {
    return e["issues"][0]["message"];
  }
}

const manifest = {
  getLabelValidationMsg: function (label: TextRecord) {
    try {
      EditableManifest.parse({ label });
      return "";
    } catch (e) {
      return e["issues"][0]["message"];
    }
  },
  getCanvasesValidationMsg: function (canvases: ObjectList) {
    try {
      EditableManifest.parse({ canvases });
      return "";
    } catch (e) {
      return e["issues"][0]["message"];
    }
  },
};

const collection = {
  getLabelValidationMsg: function (label: TextRecord) {
    try {
      EditableCollection.parse({ label });
      return "";
    } catch (e) {
      return e["issues"][0]["message"];
    }
  },
};

const typedChecks = { manifest, collection };

export { checkValidDiff, checkModelChanged, getSlugValidationMsg, typedChecks };
