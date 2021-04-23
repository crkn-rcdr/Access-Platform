export const couch = {
  url: process.env["COUCH_URL"] || "http://localhost:5984/",
  auth: {
    user: process.env["COUCH_USER"] || "kivik",
    password: process.env["COUCH_PASSWORD"] || "kivik",
  },
};

export const port = process.env["PORT"] ? parseInt(process.env["PORT"]) : 5858;
