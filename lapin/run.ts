import { server } from ".";
import { port } from "./env";

server.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
