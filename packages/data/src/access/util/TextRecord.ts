import { z } from "zod";

/** Needless to say this allows for a lot of "bad" values. */
const fakeBCP47 = /^[a-z]+(-[a-zA-Z]+)*$/;

/**
 * A record matching BCP 47 language tags to their associated string values.
 */
export const TextRecord = z.record(z.string()).superRefine((record, ctx) => {
  const keys = Object.keys(record);

  if (keys.length < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "TextRecord requires at least one key.",
    });
  }

  for (const key of keys) {
    if (!fakeBCP47.test(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${key} is not a valid BCP 47 language code.`,
      });
    }
  }
});

export type TextRecord = z.infer<typeof TextRecord>;
