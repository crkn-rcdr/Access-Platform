/**
 * @module validation
 * @description
 * This module contains methods that are used to validate that varianbles and objects are like Collections and Manifests are in a valid state.
 */

import {
  AccessObject,
  EditableAlias,
  EditableCollection,
  EditableManifest,
  TextRecord,
  ObjectList,
} from "@crkn-rcdr/access-data";
import * as isequal from "lodash.isequal";

/**
 * Checks to see if the parameter bassed in is a valid collection
 * @param objectModel
 * @returns boolean
 */
function checkValidCollection(objectModel: AccessObject) {
  try {
    const res = EditableCollection.parse(objectModel);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Checks to see if the parameter bassed in is a valid manifest
 * @param objectModel
 * @returns boolean
 */
function checkValidManifest(objectModel: AccessObject) {
  try {
    const res = EditableManifest.parse(objectModel);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Checks to see if the object passed in is valid based on its type
 * @param objectModel
 * @returns boolean
 */
function checkChangeIsValid(objectModel: AccessObject) {
  if (objectModel["type"] === "manifest") {
    return checkValidManifest(objectModel);
  } else if (objectModel["type"] === "collection") {
    return checkValidCollection(objectModel);
  }
}

/**
 * Checks to see if the object param is different form the object model param.
 * @see (fast-deep-equal)[https://www.npmjs.com/package/fast-deep-equal]
 * @param object
 * @param objectModel
 * @returns boolean
 */
function checkModelChanged(object: AccessObject, objectModel: AccessObject) {
  return !isequal(object, objectModel);
}

/**
 * Checks to see if anything is different between the object and object model by calling @function checkModelChanged then calls @function checkChangeIsValid to see if the change was valid.
 * @param object
 * @param objectModel
 * @returns boolean
 */
function checkValidDiff(object: AccessObject, objectModel: AccessObject) {
  const hasModelChanged = checkModelChanged(object, objectModel);
  if (hasModelChanged) {
    const isModelValid = checkChangeIsValid(objectModel);
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
 * @object
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
      EditableManifest.parse({ canvases });
      return "";
    } catch (e) {
      return e["issues"][0]["message"];
    }
  },
};

/**
 * @object
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
 * @object
 * @description Wrapper around the manifest and collection objects
 */
const typedChecks = { manifest, collection };

export { checkValidDiff, checkModelChanged, getSlugValidationMsg, typedChecks };
