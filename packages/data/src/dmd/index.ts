import {
  DMDTask,
  WaitingDMDTask,
  FailedDMDTask,
  SucceededDMDTask,
} from "./Task.js";

export const isWaitingDMDTask = (obj: DMDTask): obj is WaitingDMDTask => {
  return WaitingDMDTask.safeParse(obj).success;
};

export const isFailedDMDTask = (obj: DMDTask): obj is FailedDMDTask => {
  return FailedDMDTask.safeParse(obj).success;
};

export const isSucceededDMDTask = (obj: DMDTask): obj is SucceededDMDTask => {
  return SucceededDMDTask.safeParse(obj).success;
};

export {
  DMDTask,
  WaitingDMDTask,
  FailedDMDTask,
  SucceededDMDTask,
} from "./Task.js";
export { DMDFORMATS, DMDFormat, DMDOUTPUTS, DMDOutput } from "./types.js";
