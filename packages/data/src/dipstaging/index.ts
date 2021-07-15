import { JSONSchemaType } from "ajv";
import { inherit } from "../validator";

import { Identified, schema as identifiedSchema } from "../couch/util";
import { Slug, inline as slugSchema } from "../format/slug";
import { StaffUpdate, inline as staffUpdateSchema } from "../util/StaffUpdate";
import { Mets, inline as metsSchema } from "../util/Mets";
import { Timestamp, inline as timestampSchema } from "../util/Timestamp";
import {
  ProcessUpdate,
  inline as processUpdateSchema,
} from "../util/ProcessUpdate";


type DipstagingSpec = {
  /** 
   * Access slug chosen when DIP is smelted.
  */
  slug?: Slug;

  /** 
   * Array of repositories which has this AIP.
  */
  repos: string[];

  /** 
   * Date on the AIP manifest. Used to detect when the AIP has been updated, so this date should be stored with any processing.
  */
  reposManifestDate: Timestamp;

  /** 
   * Date when the above two fields were filled in.
  */
  reposDate: Timestamp;

  /** 
   * An array of METS data for the document.
  */
  METS: Mets[];

  /** 
   * Date on the AIP manifest when this field was filled in
  */
  METSManifestDate: Timestamp;

  /** 
   * Date when the METS AND METSManifestDate fields were filled in.
  */
  METSDate: Timestamp;

  /** 
   * Date when this document was last updated.
  */
  updated: Timestamp;

  /** 
   * Trigger for and result of running Smelter on this AIP.
  */
  smelt?: ProcessUpdate;

  /** 
   * A record indicating who last updated the document and when. 
  */
  staff?: StaffUpdate;
};

/**
 * Dipstaging documents are generated for every AIP in the legacy preservation platform.
 * They imply the availability of an AIP for import into the access platform.
 */
export type Dipstaging = Identified & DipstagingSpec;

const specSchema = {
  $id: "/dipstaging/Dipstaging",
  title: "Dipstaging",
  description:
    "Dipstaging documents are generated for every AIP in the legacy preservation platform. They imply the availability of an AIP for import into the access platform.",
  type: "object",
  properties: {

    slug: {
      ...slugSchema,
      nullable: true,
      description:
        "Human-readable identifier used to retrieve this object. Any such object without a slug will not be retrievable without access to the object's Noid.",
    },

    repos: {
      description: "Array of repositories which has this AIP",
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },

    reposManifestDate: {
      ...timestampSchema,
      description:
        "Date on the AIP manifest. Used to detect when the AIP has been updated, so this date should be stored with any processing.",
    },

    reposDate: {
      ...timestampSchema,
      description: "Date when the above two fields were filled in.",
    },

    METS: {
      type: "array",
      items: metsSchema,
      description: "An array of METS data for the document.",
    },

    METSManifestDate: {
      ...timestampSchema,
      description: "Date on the AIP manifest when this field was filled in",
    },

    METSDate: {
      ...timestampSchema,
      description: "Date when the above two fields were filled in.",
    },

    updated : {
      ...timestampSchema,
      description: "Date when this document was last updated",
    },

    smelt: {
      ...processUpdateSchema,
      description: "Trigger for and result of running Smelter on this AIP.",
    },

    staff: {
      ...staffUpdateSchema,
      description: "A record indicating who last updated the document and when.",
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

export const { inline, schema, validate } = inherit<Dipstaging, Identified, DipstagingSpec>(
  identifiedSchema,
  specSchema,
  false
);