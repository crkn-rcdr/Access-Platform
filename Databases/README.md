# Database schemas

Schemas for access platform databases can be found here.

Ideally, databases should be defined using [JSON Schema](https://json-schema.org/). Discussion about schemas can take place in issues/PRs.

## Use of the JSON Schema `date-time` string format

The `date-time` string format validates any ISO 8601 date-time. While in the long run this shouldn't present any issues, CouchDB 1.7 uses an old-enough version of SpiderMonkey for JavaScript parsing that we can't trust its `Date.parse()` method to do the right thing. As a result, all date-times should be entered in the format `yyyy-MM-ddThh:mm:ssZ`.

## Testing

```
$ npm install
OR
$ yarn install

$ node test.js -s <path_to_schema> -f <path_to_json_file>
```
