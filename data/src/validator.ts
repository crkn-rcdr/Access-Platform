import Ajv, { JSONSchemaType, ValidateFunction } from "ajv";

export type SchemaHelper<T> = {
  /**
   * A schema object that can be safely inlined into the definition of another
   * schema.
   */
  schema: JSONSchemaType<T>;
  /**
   * The schema's validate function.
   */
  validate: ValidateFunction<T>;
};

export const validator = new Ajv();

export const generateSchema = <T>(
  schema: JSONSchemaType<T>
): SchemaHelper<T> => {
  const full: JSONSchemaType<T> = {
    $schema: "http://json-schema.org/draft-07/schema",
    ...schema,
  };
  const { $schema, $id, title, ..._remainder } = schema;
  Object.freeze(_remainder);

  return {
    schema: _remainder as JSONSchemaType<T>,
    validate: validator.compile<T>(full),
  };
};

export const generateFormat = <T extends string>(
  name: string,
  regex: RegExp
): SchemaHelper<T> => {
  const schema = {
    $id: `/format/${name}`,
    type: "string",
    format: name,
  } as JSONSchemaType<T>;

  validator.addFormat(name, regex);

  return generateSchema(schema);
};

/**
 * Combines schemas for a subtype.
 * @param superSchema Schema for the supertype.
 * @param specSchema Schema for an object that satisfies the new constraints of
 * the subtype.
 * @param additionalProperties Sets `additionalProperties` in the new schema.
 */
export const inherit = <TSub extends TSuper & TSpec, TSuper, TSpec>(
  superSchema: JSONSchemaType<TSuper>,
  specSchema: JSONSchemaType<TSpec>,
  additionalProperties = false
): SchemaHelper<TSub> => {
  // Ideally there wouldn't need to be an unknown cast here.
  const subSchema = ({
    ...specSchema,
  } as unknown) as JSONSchemaType<TSub>;

  subSchema.properties = {
    ...superSchema.properties,
    ...specSchema.properties,
  };

  // Required array members should be unique
  subSchema.required = [...superSchema.required, ...specSchema.required].filter(
    (key, index, self) => self.indexOf(key) === index
  );

  subSchema.additionalProperties = additionalProperties;

  return generateSchema(subSchema);
};
