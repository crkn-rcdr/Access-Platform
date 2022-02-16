import {
  DMDTask,
  SucceededDMDTask,
  FailedDMDTask,
  QueuedDMDTask,
  ValidatedDMDTask,
  ValidatingDMDTask,
} from "./Task.js";

export const isQueuedDMDTask = (obj: DMDTask): obj is QueuedDMDTask => {
  return QueuedDMDTask.safeParse(obj).success;
};

export const isValidatedDMDTask = (obj: DMDTask): obj is ValidatedDMDTask => {
  return ValidatedDMDTask.safeParse(obj).success;
};

export const isValidatingDMDTask = (obj: DMDTask): obj is ValidatingDMDTask => {
  return ValidatingDMDTask.safeParse(obj).success;
};

export const isFailedDMDTask = (obj: DMDTask): obj is FailedDMDTask => {
  return FailedDMDTask.safeParse(obj).success;
};

export const isSucceededDMDTask = (obj: DMDTask): obj is SucceededDMDTask => {
  return SucceededDMDTask.safeParse(obj).success;
};

export {
  DMDTask,
  SucceededDMDTask,
  FailedDMDTask,
  QueuedDMDTask,
  ValidatedDMDTask,
  ValidatingDMDTask,
} from "./Task.js";
export { DMDFORMATS, DMDFormat, DMDOUTPUTS, DMDOutput } from "./types.js";
