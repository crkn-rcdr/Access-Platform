import { JSONSchemaType } from "ajv";

export default class Schema<T> {
  private readonly _full: JSONSchemaType<T>;
  private readonly _inline: JSONSchemaType<T>;

  constructor(spec: JSONSchemaType<T>) {
    this._full = spec;
    const { $schema, $id, title, ...inline } = this.full;
    this._inline = inline as JSONSchemaType<T>;
    Object.seal(this._full);
    Object.seal(this._inline);
  }

  get full() {
    return this._full;
  }
  get inline() {
    return this._inline;
  }

  /**
   * Oof, ok. This is how to do subtyping. Only works on type = `object`.
   * @param subSchema The schema for new subtypeconstraints. Please test
   * this on a local interface.
   * @param final Whether or not the new type will be subtyped further.
   * Sets `additionalProperties` to false.
   */
  mergeInto<U extends T>(
    subSchema: Record<string, any>, // TODO: Figure out how to type this more effectively
    final = true
  ): Schema<U> {
    if (this.full.type !== "object")
      throw new TypeError(
        "Merging is only available on schemas of type `object`."
      );
    if (!subSchema.properties)
      throw new Error("Schema does not have `properties` property.");
    if (!subSchema.required)
      throw new Error("Schema does not have `required` property.");

    subSchema.properties = {
      ...this._full.properties,
      ...subSchema.properties,
    };

    // Required array members should be unique
    subSchema.required = [...this._full.required, ...subSchema.required].filter(
      (key, index, self) => self.indexOf(key) === index
    );

    if (final) subSchema.additionalProperties = false;

    return new Schema(subSchema as JSONSchemaType<U>);
  }
}
