import dotenv from "dotenv";
import type { User } from "./hooks";
dotenv.config();

const throwEnvError = (name: string) => {
  throw new Error(`${name} environment variable required`);
};

export const dev = process.env["NODE_ENV"] !== "production";
export const port = parseInt(process.env["PORT"], 10) || 3060;

export const devUser: User | null = dev
  ? {
      name: process.env["DEV_USER_NAME"] || "Dev User",
      email: process.env["DEV_USER_EMAIL"] || "platform@crkn.ca",
    }
  : null;

export const host = dev ? `http://localhost:${port}` : process.env["HOST"];
if (!host.length) throw new Error("HOST environment variable required");

export const auth = dev
  ? null
  : {
      endpoint: process.env["AUTH_ENDPOINT"],
      secret: process.env["AUTH_SECRET"],
    };

if (auth && !auth.endpoint.length) throwEnvError("AUTH_ENDPOINT");
if (auth && !auth.secret.length) throwEnvError("AUTH_SECRET");
