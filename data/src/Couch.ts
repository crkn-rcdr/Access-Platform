import { JSONSchemaType } from "ajv";
import Schema from "./Schema";

/**
 * Any object identified by an `id` string.
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

/**
 * A CouchDB document representing an object with an `id` string.
 */
export type Document<T extends Identified> = { _id: string } & Omit<T, "id">;

/**
 * Translate a CouchDB document into an interoperable one.
 * @param doc The CouchDB document.
 */
export const fromCouch = <T extends Identified>(doc: Document<T>): T => {
  const { _id, ...rest } = doc;
  return ({
    id: _id,
    ...rest,
  } as unknown) as T;
};

/**
 * Translate an interoperable object into something that can be inserted
 * into CouchDB.
 * @param obj An interoperable object.
 */
export const toCouch = <T extends Identified>(obj: T): Document<T> => {
  const { id, ...rest } = obj;
  return ({
    _id: id,
    ...rest,
  } as unknown) as Document<T>;
};

/**
 * Translate a JSON schema for any object with an `id` string into a JSON
 * schema for the CouchDB document representing it.
 * @param schema The JSON schema.
 */
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
