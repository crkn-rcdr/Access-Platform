import { server } from "@crkn-rcdr/hare-router";
import { Env } from "@crkn-rcdr/access-env";
const {
  hare: { port },
} = Env.parse(process.env);

console.log(`Starting hare on port ${port}.`);

// Run the server!
const start = async () => {
  try {
    await server.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start().then(() => {
  console.log("server listening at port", port);
});
