import { ExecutionContext } from "ava";
import { ValidateFunction } from "ajv";

const _tester = <T>(validate: ValidateFunction<T>, expected: boolean) => (
  t: ExecutionContext,
  input: any
) => {
  const valid = validate(input);
  if (valid !== expected) {
    if (!valid) {
      console.log(validate.errors);
    }
  }
  t.is(valid, expected);
};

export const tester = <T>(validate: ValidateFunction<T>) => {
  return {
    isValid: _tester(validate, true),
    isInvalid: _tester(validate, false),
  };
};
