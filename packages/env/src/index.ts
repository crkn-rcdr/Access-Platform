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
    COUCHDB_URL: Url,
    COUCHDB_PASSWORD: z.string().min(1),
    LAPIN_URL: Url,
    HARE_URL: Url,
    NOID_URL: Url,
    SWIFT_URL: Url,
    SWIFT_USER: z.string().min(1),
    SWIFT_PASSWORD: z.string().min(1),
    /**
     * OPTIONAL: Also defined, but with defaults. You may need to override these.
     */
    AUTH_URL: Url.default("https://auth.canadiana.ca"),
    COUCHDB_USER: z.string().min(1).default("admin"),
    SWIFT_ACCOUNT: z.string().min(1).default("AUTH_crkn"),
    /**
     * ADDITIONAL: You likely won't need to set these.
     */
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ADMIN_DEV_WS_PORT: Port.default("14747"),
    ADMIN_PORT: Port.default("4747"),
    LAPIN_PORT: Port.default("5858"),
    HARE_PORT: Port.default("5959"),
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
        url: env.LAPIN_URL,
      },
      hare: {
        port: env.HARE_PORT,
        url: env.HARE_URL,
      },
      noid: {
        url: env.NOID_URL,
      },
      swift: {
        server: env.SWIFT_URL,
        user: env.SWIFT_USER,
        password: env.SWIFT_PASSWORD,
        account: env.SWIFT_ACCOUNT,
      },
    };
  });

export type Env = z.infer<typeof Env>;
