import {
  DMDTask,
  UpdateSucceededDMDTask,
  ParseFailedDMDTask,
  UpdateFailedDMDTask,
  UpdatingDMDTask,
  ParseSucceededDMDTask,
  ParsingDMDTask,
} from "./Task.js";

export const isUpdatingDMDTask = (obj: DMDTask): obj is UpdatingDMDTask => {
  return UpdatingDMDTask.safeParse(obj).success;
};

export const isParseSucceededDMDTask = (
  obj: DMDTask
): obj is ParseSucceededDMDTask => {
  return ParseSucceededDMDTask.safeParse(obj).success;
};

export const isParseFailedDMDTask = (
  obj: DMDTask
): obj is ParseFailedDMDTask => {
  return ParseFailedDMDTask.safeParse(obj).success;
};

export const isParsingDMDTask = (obj: DMDTask): obj is ParsingDMDTask => {
  return ParsingDMDTask.safeParse(obj).success;
};

export const isUpdateFailedDMDTask = (
  obj: DMDTask
): obj is UpdateFailedDMDTask => {
  return UpdateFailedDMDTask.safeParse(obj).success;
};

export const isUpdateSucceededDMDTask = (
  obj: DMDTask
): obj is UpdateSucceededDMDTask => {
  return UpdateSucceededDMDTask.safeParse(obj).success;
};

export {
  DMDTask,
  UpdateSucceededDMDTask,
  UpdateFailedDMDTask,
  UpdatingDMDTask,
  ParseSucceededDMDTask,
  ParseFailedDMDTask,
  ParsingDMDTask,
} from "./Task.js";
export { DMDFORMATS, DMDFormat, DMDOUTPUTS, DMDOutput } from "./types.js";
