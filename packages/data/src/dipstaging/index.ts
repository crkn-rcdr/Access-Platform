import { JSONSchemaType } from "ajv";
import { inherit } from "../validator";

import { Identified, schema as identifiedSchema } from "../couch/util";
//import { Root, schema as rootSchema } from "../access/Root";

import { Slug, inline as slugSchema } from "../format/slug";
import { StaffUpdate, inline as staffUpdateSchema } from "../util/StaffUpdate";
import { Mets, inline as metsSchema } from "../util/Mets";
import { Timestamp, inline as timestampSchema } from "../util/Timestamp";
import {
  ProcessUpdate,
  inline as processUpdateSchema,
} from "../util/ProcessUpdate";


type DipstagingSpec = {
  // does this need to be called id? Should I not extend identified and just put id string?
  id: string;

  slug?: Slug;

  repos: string[];

  reposManifestDate: Timestamp;

  reposDate: Timestamp;

  METS: Mets[];

  METSManifestDate: Timestamp;

  METSDate: Timestamp;

  updated: Timestamp;

  smelt?: ProcessUpdate;

  staff?: StaffUpdate;
};

/**
 * dipstaging documents are generated for every AIP in the legacy preservation platform.
 * They imply the availability of an AIP for import into the access platform.
 */
export type Dipstaging = Identified & DipstagingSpec;

const specSchema = {
  $id: "/dipstaging/Dipstaging",
  title: "dipstaging Document Schema",
  description:
    "dipstaging documents are generated for every AIP in the legacy preservation platform. They imply the availability of an AIP for import into the access platform.",
  type: "object",
  properties: {
    // does this need to be called id? Should I not extend identified and just put id string?
    id: {
      description: "Legacy preservation platform AIP ID",
      type: "string",
    },

    slug: {
      ...slugSchema,
      nullable: true,
      description:
        "Human-readable identifier used to retrieve this object. Any such object without a slug will not be retrievable without access to the object's Noid.",
    },

    repos: {
      description: "array of repositories which has this AIP",
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },

    reposManifestDate: {
      ...timestampSchema,
      description:
        "date on the AIP manifest. Used to detect when the AIP has been updated, so this date should be stored with any processing.",
    },

    reposDate: {
      ...timestampSchema,
      description: "date when the above two fields were filled in.",
    },

    METS: {
      type: "array",
      items: metsSchema,
    },

    METSManifestDate: {
      ...timestampSchema,
      description: "date on the AIP manifest when this field was filled in",
    },

    METSDate: {
      ...timestampSchema,
      description: "date when the above two fields were filled in.",
    },

    updated : {
      ...timestampSchema,
      description: "date when this document was last updated",
    },

    smelt: {
      ...processUpdateSchema,
    },

    staff: {
      ...staffUpdateSchema,
      description: "Reference to the base image file.",
    },
  },
  required: [
    "repos",
    "reposManifestDate",
    "reposDate",
    "METS",
    "METSManifestDate",
    "METSDate",
    "updated",
  ],
} as JSONSchemaType<DipstagingSpec>;

//export const { inline, schema, validate } = specSchema;

export const { inline, schema, validate } = inherit<Dipstaging, Identified, DipstagingSpec>(
  identifiedSchema,
  specSchema,
  false
);