import { z } from "zod";

export const UnixFilePath = z.string().regex(/^[^\x00]+$/, "Invalid file path");

export type UnixFilePath = z.infer<typeof UnixFilePath>;
