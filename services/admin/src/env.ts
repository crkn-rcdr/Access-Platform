import type { AccessorOptions } from "@crkn-rcdr/accessor/dist/cjs/endpoints";
import dotenv from "dotenv";
import type { User } from "./hooks";

dotenv.config();

const getFromEnv = (name: string, defaultValue?: string): string => {
  const value = process.env[name];
  if (value) {
    return value;
  } else if (defaultValue) {
    return defaultValue;
  } else {
    throw new Error(`${name} environment variable required`);
  }
};

export const dev = process.env["NODE_ENV"] !== "production";
export const port = parseInt(getFromEnv("PORT", "3060"), 10);
export const host = dev ? `http://localhost:${port}` : getFromEnv("HOST");

export const devUser: User | null = dev
  ? {
      name: getFromEnv("DEV_USER_NAME", "Dev User"),
      email: getFromEnv("DEV_USER_EMAIL", "dev@crkn.ca"),
    }
  : null;

export const auth = dev
  ? null
  : {
      endpoint: getFromEnv("AUTH_ENDPOINT"),
      secret: getFromEnv("AUTH_SECRET"),
    };

export const accessorArgs: AccessorOptions = {
  couch: {
    url: getFromEnv("COUCH_ENDPOINT"),
    auth: {
      user: getFromEnv("COUCH_USER"),
      password: getFromEnv("COUCH_PASSWORD"),
    },
  },
};
