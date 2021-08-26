import { Env } from "@crkn-rcdr/access-env";
import { Client } from "@crkn-rcdr/swift";

export function initializeSwift() {
  const { mode, swift } = Env.parse(process.env);
  const client = new Client(swift);

  console.log("mode", mode);
  if (mode !== "production") {
    client.createContainer("access-files").then(() => {
      console.log("Done making");
    });

    client.createContainer("access-metadata").then(() => {
      console.log("Done making access-metadata");
    });
  }

  return {
    //client,
    accessFiles: client.container("access-files"),
    accessMetadata: client.container("access-metadata"),
  };
}
