import { JSONSchemaType } from "ajv";
import Schema from "./Schema";

/**
 * An object that can interface with CouchDB
 */
export interface Identified {
  id: string;
  _rev?: string;
}

export const identifiedSchema = new Schema<Identified>({
  $id: "/root.json",
  type: "object",
  properties: {
    id: { type: "string" },
    _rev: { type: "string", nullable: true },
  },
  required: ["id"],
});

export type Document<T extends Identified> = { _id: string } & Omit<T, "id">;

export const fromCouch = <T extends Identified>(doc: Document<T>): T => {
  const { _id, ...rest } = doc;
  return ({
    id: _id,
    ...rest,
  } as unknown) as T;
};

export const toCouch = <T extends Identified>(obj: T): Document<T> => {
  const { id, ...rest } = obj;
  return ({
    _id: id,
    ...rest,
  } as unknown) as Document<T>;
};

export const toCouchSchema = <T extends Identified>(
  schema: JSONSchemaType<T>
): JSONSchemaType<Document<T>> => {
  if (!schema.properties)
    throw new Error("Schema does not have `properties` property.");
  if (!schema.$id) throw new Error("Schema does not have `$id` property.");
  const { id, ...properties } = schema.properties;
  const required = ["_id", ...schema.required.filter((key) => key === "id")];
  return ({
    ...schema,
    $id: `/couch${schema.$id}`,
    properties: {
      _id: id,
      ...properties,
    },
    required,
  } as unknown) as JSONSchemaType<Document<T>>;
};
