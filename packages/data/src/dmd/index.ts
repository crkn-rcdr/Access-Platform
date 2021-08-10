export {
  DMDTask,
  WaitingDMDTask,
  FailedDMDTask,
  SucceededDMDTask,
} from "./Task.js";

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
