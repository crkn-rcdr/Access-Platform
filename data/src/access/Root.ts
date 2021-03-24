import { JSONSchemaType } from "ajv";
import { inherit } from "../validator";
import { Identified, schema as identifiedSchema } from "../couch/util";
import { Noid, inline as noidSchema } from "../format/noid";
import { Timestamp, inline as timestampSchema } from "../util/Timestamp";
import {
  ProcessUpdate,
  inline as processUpdateSchema,
} from "../util/ProcessUpdate";

type RootSpec = {
  /**
   * This resource's Noid. It's a unique, opaque identifier.
   */
  id: Noid;
  /**
   * If set, the object was made available to the public at this time.
   * If unset, it is not available to the public.
   */
  public?: Timestamp;
  /**
   * Timestamp for when this object was last updated.
   */
  updated?: Timestamp;
  /**
   * Information about the most recent update to the internalmeta database
   * made because of changes to this object.
   */
  updateInternalmeta?: ProcessUpdate;
};

export type Root = Identified & RootSpec;

const specSchema = {
  $id: "/access/Root",
  title: "Access Object",
  type: "object",
  properties: {
    id: {
      ...noidSchema,
      description: "This resource's Noid. It's a unique, opaque identifier.",
    },
    public: {
      ...timestampSchema,
      description:
        "If set, the object was made available to the public at this time. If unset, it is not available to the public.",
    },
    updated: {
      ...timestampSchema,
      description: "Timestamp for when this object was last updated.",
    },
    updateInternalmeta: {
      ...processUpdateSchema,
      nullable: true,
      description:
        "Information about the most recent update to the internalmeta database made because of changes to this object.",
    },
  },
  required: ["id"],
} as JSONSchemaType<RootSpec>;

export const { inline, schema, validate } = inherit<Root, Identified, RootSpec>(
  identifiedSchema,
  specSchema,
  true
);
