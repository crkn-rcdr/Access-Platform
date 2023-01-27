/**
 * Types of descriptive metadata that our tools support.
 */
export const MDTYPES = [
  "csvissueinfo",
  "csvdc",
  "marc490",
  "marcoocihm",
  "marcooe",
] as const;

/**
 * A type of descriptive metadata that our tools support.
 */
export type MDType = typeof MDTYPES[number];

/**
 * Supported DMD file formats.
 * TODO: We can also create an object with these as keys,
 * which can specify things like the expected Content-Type
 * of the file, and a human-readable label for the format.
 */
export const DMDFORMATS = [
  "csvissueinfo",
  "csvdc",
  "marc490",
  "marcoocihm",
  "marcooe",
  "marc856"
] as const;

/**
 * The uploaded file's specified format.
 */
export type DMDFormat = typeof DMDFORMATS[number];

/**
 * Types of outputs that the metadata processor produces.
 */
export const DMDOUTPUTS = ["dc", "issueinfo", "marc"] as const;

/**
 * The type of output that the metadata processor produced.
 */
export type DMDOutput = typeof DMDOUTPUTS[number];
