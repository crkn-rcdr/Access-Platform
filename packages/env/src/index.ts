import { z } from "zod";

/**
 * A structured object containing all environment variables expected by the Access Platform.
 * Usage: `const ENV = Env.parse(process.env)` */
export const Env = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ADMIN_PORT: z.string().refine((portString) => parseInt(portString, 10)),
    COUCHDB_URL: z.string().url(),
    COUCHDB_USER: z.string().min(1),
    COUCHDB_PASSWORD: z.string().min(1),
  })
  .transform((env) => {
    return {
      mode: env.NODE_ENV,
      couch: {
        url: env.COUCHDB_URL,
        auth: {
          username: env.COUCHDB_USER,
          password: env.COUCHDB_PASSWORD,
        },
      },
    };
  });

export type Env = z.infer<typeof Env>;
