import { RouteSet } from ".";
import { send } from "..";

const routeSet: RouteSet = {
  prefix: "/slug",
  routes: [
    {
      method: "GET",
      pattern: "/:slug",
      help: {
        description: "Resolves a slug into a noid.",
        params: { slug: "The slug to resolve." },
        returns: {
          200: "The resolved noid, or null if the slug does not resolve.",
        },
      },
      handler: async (req, res) => {
        const slug = req.params["slug"] as string;
        send(res, 200, await req.accessor.slug.resolve(slug));
      },
    },
    {
      method: "POST",
      pattern: "/resolve",
      help: {
        description: "Resolves a list of slugs to noids.",
        query: {
          prefix: "Prefix to prepend to each slug when looking it up.",
        },
        body: "An array of slugs.",
        returns: {
          200: "An object with slugs as keys and values that are noids or null.",
          400: "The body of the request is not an array of strings.",
        },
      },
      handler: async (req, res) => {
        if (
          Array.isArray(req.body) &&
          req.body.every((thing) => typeof thing === "string")
        ) {
          const response = await req.accessor.slug.resolveMany(
            req.body,
            req.getQueryParam("prefix")
          );
          send(res, 200, Object.fromEntries(response));
        } else {
          throw {
            code: 400,
            message: "An array of strings is required in the request body.",
          };
        }
      },
    },
    {
      method: "POST",
      pattern: "/search/:term",
      help: {
        description: "Searches for slugs that start with a search term.",
        params: {
          term: "The search term.",
        },
        returns: {
          200: "An array of tuples of the form [slug, noid], with ten entries at maximum.",
        },
      },
      handler: async (req, res) => {
        const term = req.params["term"] as string;
        return send(res, 200, [
          ...(await req.accessor.slug.search(term)).entries(),
        ]);
      },
    },
  ],
};

export default routeSet;
