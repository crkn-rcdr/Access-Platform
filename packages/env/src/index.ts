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
    /**
     * REQUIRED: Applications will fail if these are unset.
     */
    ADMIN_URL_EXTERNAL: Url,
    AUTH_JWT_SECRET: z.string().min(1),
    COUCHDB_PASSWORD: z.string().min(1),
    /**
     * OPTIONAL: Also defined, but with defaults. You may need to override these.
     */
    AUTH_URL: Url.default("https://auth.canadiana.ca"),
    COUCHDB_URL: Url.default("http://couch:5984"),
    COUCHDB_USER: z.string().min(1).default("admin"),
    /**
     * ADDITIONAL: You likely won't need to set these.
     */
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ADMIN_DEV_WS_PORT: Port.default("14747"),
    ADMIN_PORT: Port.default("4747"),
    LAPIN_PORT: Port.default("5858"),
    LAPIN_URL_INTERNAL: Url.default("http://lapin:5858"),
  })
  .transform((env) => {
    return {
      mode: env.NODE_ENV,
      admin: {
        port: env.ADMIN_PORT,
        wsPort: env.ADMIN_DEV_WS_PORT,
        urlExternal: env.ADMIN_URL_EXTERNAL,
      },
      auth: {
        url: env.AUTH_URL,
        secret: env.AUTH_JWT_SECRET,
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
