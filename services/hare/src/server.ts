import { server } from "@crkn-rcdr/hare-router";
import { Env } from "@crkn-rcdr/access-env";
const {
  hare: { port },
} = Env.parse(process.env);

console.log(`Starting hare on port ${port}.`);

server.listen(port, function () {
  console.log("%s listening at %s", server.name, server.url);
});
