import { JSONSchemaType } from "ajv";
import { Slugged, schema as sluggedSchema } from "./Slugged";
import { Text, schema as textSchema } from "../Util/Text";

const DMD = ["dc", "marc", "issueinfo"];

export interface Local {
  /**
   * Human-readable name or title.
   */
  label: Text;
  /**
   * A short textual summary.
   */
  summary?: Text;
  /**
   * The type of descriptive metadata record associated with this resource. */
  dmdType: typeof DMD[number];
}

/**
 * A slugged object representing a real thing, as opposed to an alias.
 */
export interface Canonical extends Slugged, Local {}

export const schema = sluggedSchema.mergeInto<Canonical>({
  $id: "/access/canonical.json",
  title: "Canonical object",
  type: "object",
  properties: {
    label: textSchema.inline,
    summary: { ...textSchema.inline, nullable: true },
    dmdType: { type: "string", enum: DMD },
  },
  required: ["label"],
} as JSONSchemaType<Local>);
