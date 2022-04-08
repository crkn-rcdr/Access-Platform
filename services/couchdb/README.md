# services/couchdb - CouchDB configuration

This service contains the configuration that powers our CouchDB databases.

## Kivik

To deploy with Kivik, copy [`./kivikrc.example.json`](kivikrc.example.json) to `kivikrc.json`, and replace the placeholder password with our production CouchDB password. You can then run:

    $ kivik deploy production

to deploy design docs and indexes to our Couch endpoint on `jarlsberg.tor.c7a.ca`.

## Design documents

[`./prelude.js`](prelude.js) contains functions that design document functions can import and use, using CouchDB's [CommonJS module system](https://docs.couchdb.org/en/3.1.1/query-server/javascript.html#commonjs-modules). Ensure that the relevant design directory has a symlink to the root directory's prelude file in `lib/prelude.js`.

## Notes on configuration options

These can be put into the `local.d/docker.ini` file, or added within the config tab (which saves changes to the `local.d/docker.ini` file).

```
[couchdb]
max_document_size = 4294967296
```

If you need to test the `cosearch` database, it has some quite large documents and you will need to increase the maximum document size in order to replicate.

```
[chttpd]
require_valid_user = false
```

If you wish to emulate the CouchDB 1.x default of allowing **Members** access to unauthenthicated users, you would set this and then remove any "Users" or "Roles" from **Members** via the permissions tab of the database. By default the `_admin` role is added to **Members**.

```
[query_servers]
javascript = /opt/couchdb/bin/couchjs -S 1073741824 /opt/couchdb/share/server/main.js
coffeescript = /opt/couchdb/bin/couchjs -S 1073741824 /opt/couchdb/share/server/main-coffee.js
```

Some views may take more memory to build. `couchjs` has a default of 64MiB. This sets up to allow 1G. The [Query Servers Documentation](https://docs.couchdb.org/en/latest/config/query-servers.html) provides additional details.

```
[couch_httpd_auth]
timeout = 86400
```

The [default timeout is 10 minutes](https://docs.couchdb.org/en/latest/config/auth.html#couch_httpd_auth/timeout), and having to log in again so frequently is annoying.
