/**
 * @module validation
 * @description
 * This module contains methods that are used to validate that varianbles and serverObjects are like Collections and Manifests are in a valid state.
 */

import {
  AccessObject,
  EditableAlias,
  EditableCollection,
  EditableManifest,
  TextRecord,
  ObjectList,
} from "@crkn-rcdr/access-data";
import isEqual from "lodash-es/isEqual";

/**
 * Checks to see if the parameter bassed in is a valid collection
 * @param editorObject
 * @returns boolean
 */
function checkValidCollection(editorObject: AccessObject) {
  try {
    const res = EditableCollection.parse(editorObject);
    return true;
  } catch (e) {
    console.log(e?.message);
    return false;
  }
}

/**
 * Checks to see if the parameter bassed in is a valid manifest
 * @param editorObject
 * @returns boolean
 */
function checkValidManifest(editorObject: AccessObject) {
  try {
    const res = EditableManifest.parse(editorObject);
    return true;
  } catch (e) {
    console.log(e?.message);
    return false;
  }
}

/**
 * Checks to see if the serverObject passed in is valid based on its type
 * @param editorObject
 * @returns boolean
 */
function checkChangeIsValid(editorObject: AccessObject) {
  console.log(editorObject["type"]);
  if (editorObject["type"] === "manifest") {
    return checkValidManifest(editorObject);
  } else if (editorObject["type"] === "collection") {
    return checkValidCollection(editorObject);
  }
}

/**
 * Checks to see if the serverObject param is different form the serverObject model param.
 * @see (fast-deep-equal)[https://www.npmjs.com/package/fast-deep-equal]
 * @param serverObject
 * @param editorObject
 * @returns boolean
 */
function checkModelChanged(
  serverObject: AccessObject,
  editorObject: AccessObject
) {
  return !isEqual(serverObject, editorObject);
}

/**
 * Checks to see if anything is different between the serverObject and serverObject model by calling @function checkModelChanged then calls @function checkChangeIsValid to see if the change was valid.
 * @param serverObject
 * @param editorObject
 * @returns boolean
 */
function checkValidDiff(
  serverObject: AccessObject,
  editorObject: AccessObject
) {
  const hasModelChanged = checkModelChanged(serverObject, editorObject);
  if (hasModelChanged) {
    const isModelValid = checkChangeIsValid(editorObject);
    if (isModelValid) return true;
    return false;
  }
  return false;
}

/**
 * Validates the slug passed in. Returns a message if the slug is invalid.
 * @param slug
 * @returns string
 */
function getSlugValidationMsg(slug: string) {
  try {
    EditableAlias.pick({ slug: true }).parse({ slug });
    return "";
  } catch (e) {
    return e["issues"][0]["message"];
  }
}

/**
 * @serverObject
 * @description wrapper around the validation functions specifically for the manifest type
 */
const manifest = {
  /**
   * Validates the label passed in. Returns a message if the TextRecord is invalid.
   * @param label
   * @returns string
   */
  getLabelValidationMsg: function (label: TextRecord) {
    try {
      EditableManifest.parse({ label });
      return "";
    } catch (e) {
      return e["issues"][0]["message"];
    }
  },
  /**
   * Validates the ObjectList passed in. Returns a message if the ObjectList is invalid.
   * @param canvases
   * @returns string
   */
  getCanvasesValidationMsg: function (canvases: ObjectList) {
    try {
      console.log(JSON.stringify(canvases));
      EditableManifest.parse({ canvases });
      return "";
    } catch (e) {
      console.log(e);
      return e["issues"][0]["message"];
    }
  },
};

/**
 * @serverObject
 * @description wrapper around the validation functions specifically for the collection type
 */
const collection = {
  /**
   * Validates the label passed in. Returns a message if the TextRecord is invalid.
   * @param label
   * @returns string
   */
  getLabelValidationMsg: function (label: TextRecord) {
    try {
      EditableCollection.parse({ label });
      return "";
    } catch (e) {
      return e["issues"][0]["message"];
    }
  },
};

/**
 * @serverObject
 * @description Wrapper around the manifest and collection serverObjects
 */
const typedChecks = { manifest, collection };

export { checkValidDiff, checkModelChanged, getSlugValidationMsg, typedChecks };
