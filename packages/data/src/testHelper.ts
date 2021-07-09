import { ExecutionContext } from "ava";
import { ZodTypeAny } from "zod";

const _tester =
  (schema: ZodTypeAny, expected: boolean) =>
  (t: ExecutionContext, input: any) => {
    const test = schema.safeParse(input);
    if (test.success !== expected) t.log(test);
    t.is(test.success, expected);
  };

export const tester = (schema: ZodTypeAny) => {
  return {
    isValid: _tester(schema, true),
    isInvalid: _tester(schema, false),
  };
};
