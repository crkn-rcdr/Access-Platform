import Ajv, { ValidateFunction } from "ajv";
import Schema from "./Schema";
import { Format } from "./Format";

const FORMATS: Format<string>[] = [];

export const registerFormat = (format: Format<string>) => {
  FORMATS.push(format);
};

export default class Validator {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv();
    for (const format of FORMATS) {
      format.addTo(this.ajv);
    }
  }

  /**
   * Compiles a JSON Schema, and returns a function that can validate
   * data against it.
   */
  compile<T>(schema: Schema<T>): ValidateFunction<T> {
    return this.ajv.compile<T>(schema.full);
  }
}
