import Ajv, { JSONSchemaType } from "ajv";
import Schema from "../Schema";
import { registerFormat } from "../Validator";

export interface Format<T extends string> {
  name: string;
  regex: RegExp;
  schema: Schema<T>;
  addTo: (ajv: Ajv) => void;
}

export default <T extends string>(name: string, regex: RegExp): Format<T> => {
  const format = {
    name,
    regex,
    schema: new Schema({
      $id: `/format/${name}.json`,
      type: "string",
      format: name,
    } as JSONSchemaType<T>),
    addTo: (ajv: Ajv) => ajv.addFormat(name, regex),
  };
  registerFormat(format);
  return format;
};
