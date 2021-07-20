import { z } from "zod";

const Port = z
  .string()
  .transform((portString) => parseInt(portString, 10))
  .refine((port) => Number.isInteger(port) && port > 1024 && port < 65536);

const Url = z.string().url();

/**
 * A structured object containing all environment variables expected by the Access Platform.
 * Usage: `const ENV = Env.parse(process.env)` */
export const Env = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ADMIN_DEV_WS_PORT: Port.optional(),
    ADMIN_PORT: Port,
    ADMIN_URL_EXTERNAL: Url,
    ADMIN_URL_INTERNAL: Url,
    COUCHDB_URL: Url,
    COUCHDB_USER: z.string().min(1),
    COUCHDB_PASSWORD: z.string().min(1),
    LAPIN_PORT: Port,
    LAPIN_URL_INTERNAL: Url,
  })
  .transform((env) => {
    return {
      mode: env.NODE_ENV,
      admin: {
        port: env.ADMIN_PORT,
        wsPort: env.ADMIN_DEV_WS_PORT,
        urlExternal: env.ADMIN_URL_EXTERNAL,
        urlInternal: env.ADMIN_URL_INTERNAL,
      },
      couch: {
        url: env.COUCHDB_URL,
        auth: {
          username: env.COUCHDB_USER,
          password: env.COUCHDB_PASSWORD,
        },
      },
      lapin: {
        port: env.LAPIN_PORT,
        urlInternal: env.LAPIN_URL_INTERNAL,
      },
    };
  });

export type Env = z.infer<typeof Env>;
