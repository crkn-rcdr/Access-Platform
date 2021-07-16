import { z } from "zod";

/**
 * MD5 checksum.
 */
export const MD5 = z.string().regex(/^[0-9a-f]{32}$/);

export type MD5 = z.infer<typeof MD5>;
