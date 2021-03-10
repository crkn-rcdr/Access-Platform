import { generateFormat } from "../validator";

const name = "unix-file-path";
const regex = /^[^\x00]+$/;

/**
 * A UNIX file path.
 */
export type UnixFilePath = string;

export const { inline, schema, validate } = generateFormat<UnixFilePath>(
  name,
  regex
);
