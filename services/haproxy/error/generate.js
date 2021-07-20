#!/usr/bin/env node

const fs = require("fs");
const minify = require("html-minifier").minify;
const errorHtml = minify(fs.readFileSync("error.html", "utf8"), {
  collapseWhitespace: true,
  html5: true,
  minifyCSS: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true,
  removeEmptyElements: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
});

const headerForm = `HTTP/1.0 $CODE\r\nCache-Control: no-cache\r\nConnection: close\r\nContent-Type: text/html`;

const errors = {
  400: "Bad Request",
  403: "Forbidden",
  405: "Method Not Allowed",
  408: "Request Timeout",
  425: "Too Early",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

const clientTitle = { en: "Client Error", fr: "Erreur de client" };
const serverTitle = { en: "Server Error", fr: "Erreur de serveur" };

const writeError = (code) => {
  let isServer = code >= 500;
  let title = isServer ? serverTitle : clientTitle;
  let file = `${headerForm}\r\n\r\n${errorHtml}`
    .replace(/\$CODE/g, `${code} ${errors[code]}`)
    .replace(/\$TITLE/g, `${title.en} | ${title.fr}`);
  fs.writeFileSync(`${code}.http`, file);
};

Object.keys(errors).map((code) => writeError(code));
