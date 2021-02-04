# couchdb
CouchDB configuration for the Canadiana Access Platform's suite of services

This repo contains an example CouchDB config for setting up a Canadiana platform development environment.

## Setup

```
$ docker-compose up
```

* Go to http://localhost:5984/_utils/ and log in  (Default username/password in compose file is admin/admin)
* Go to setup (the wrench)
* Click "Configure a Single Node"
* Type in the username/password same as login

You now have a default configuration.


Other possible configuration options you may wish to add.  These can be put into the `local.d/docker.ini` file, or added within the config tab (which saves changes to the `local.d/docker.ini` file).



```
[couchdb]
max_document_size = 4294967296
```

If you need to test the `cosearch` database, it has some quite large documents and you will need to increase the maximum document size in order to replicate.


```
[chttpd]
require_valid_user = false
```

If you wish to emulate the CouchDB 1.x default of allowing **Members** access to unauthenthicated users, you would set this and then remove any "Users" or "Roles" from **Members** via the permissions tab of the database.  By default the `_admin` role is added to **Members**.


```
[query_servers]
javascript = /opt/couchdb/bin/couchjs -S 1073741824 /opt/couchdb/share/server/main.js
coffeescript = /opt/couchdb/bin/couchjs -S 1073741824 /opt/couchdb/share/server/main-coffee.js
```

Some views may take more memory to build. `couchjs` has a default of  64MiB. This sets up to allow 1G.  The [Query Servers Documentation](https://docs.couchdb.org/en/latest/config/query-servers.html) provides additional details.
