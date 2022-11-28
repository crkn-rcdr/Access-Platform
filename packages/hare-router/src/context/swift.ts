import { Env } from "@crkn-rcdr/access-env";
import { Client } from "@crkn-rcdr/swift";

// TODO: Figure out how to do this in docker for dev
function inititializeSwiftContainers(client: Client) {
  client.listContainers().then((data) => {
    let containers = data.content.map((container) => container.name);
    //console.log("Swift containers: ", containers);
    if (!containers.includes("access-files")) {
      client.createContainer("access-files").then(() => {
        //console.log("Done making");
      });
    }
    if (!containers.includes("access-metadata")) {
      client.createContainer("access-metadata").then(() => {
        //console.log("Done making access-metadata");
      });
    }
  });
}

export function initializeSwift() {
  const { mode, swift } = Env.parse(process.env);
  const client = new Client(swift);

  if (mode !== "production") inititializeSwiftContainers(client);

  return {
    accessFiles: client.container("access-files"),
    accessMetadata: client.container("access-metadata"),
  };
}
