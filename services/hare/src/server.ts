import { server } from "@crkn-rcdr/hare-router";
server.listen(5959, function () {
  console.log("%s listening at %s", server.name, server.url);
});
