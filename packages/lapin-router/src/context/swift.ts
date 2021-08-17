import { Env } from "@crkn-rcdr/access-env";
import { Client } from "@crkn-rcdr/swift";

export function initializeSwift() {
  const { swift } = Env.parse(process.env);
  const client = new Client(swift);

  return {
    accessFiles: client.container("access-files"),
    accessMetadata: client.container("access-metadata"),
  };
}
