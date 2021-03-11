import { JSONSchemaType } from "ajv";
import { inherit } from "../validator";
import { Identified, schema as identifiedSchema } from "../couch/util";
import { Noid, inline as noidSchema } from "../format/Noid";
import { Timestamp, inline as timestampSchema } from "../format/Timestamp";
import {
  ProcessUpdate,
  inline as processUpdateSchema,
} from "../util/ProcessUpdate";

type RootSpec = {
  /**
   * Unique identifier for this resource.
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
  $id: "/access/object",
  title: "Access Object",
  type: "object",
  properties: {
    id: noidSchema,
    public: { ...timestampSchema, nullable: true },
    updated: { ...timestampSchema, nullable: true },
    updateInternalmeta: { ...processUpdateSchema, nullable: true },
  },
  required: ["id"],
} as JSONSchemaType<RootSpec>;

export const { inline, schema, validate } = inherit<Root, Identified, RootSpec>(
  identifiedSchema,
  specSchema,
  true
);
