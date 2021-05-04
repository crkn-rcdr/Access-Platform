import { validator } from "@crkn-rcdr/access-data";
import { RouteSet } from ".";
import { send } from "..";

const routes: RouteSet = {
  prefix: "/validate",
  routes: [
    {
      method: "POST",
      pattern: "/*",
      help: {
        description: "Validates data against an Access Platform schema.",
        params: {
          "*":
            "The $id of the schema, minus the initial slash. e.g. /validate/couch/access",
        },
        body: "Data serialized into JSON.",
        returns: {
          204: "The data validates against the schema.",
          400: "The schema requested in the request does not exist.",
          404: "The data does not validate against the schema. The Ajv errors object is returned.",
        },
      },
      handler: async (req, res) => {
        const schema = `/${req.params["wild"]}`;
        const validate = validator.getSchema(schema);
        if (validate) {
          const valid = validate(req.body);
          if (valid) {
            send(res, 204);
          } else {
            send(res, 404, validate.errors);
          }
        } else {
          throw {
            code: 400,
            message: `There is no schema with $id: ${schema}`,
          };
        }
      },
    },
  ],
};

export default routes;
