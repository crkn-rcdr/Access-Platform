# services/haproxy - HAProxy configuration

This directory contains the HAProxy configuration for the Access Platform development environment, along with the error pages we use when services are down.

## Setup

```
$ echo whatevertextyoulike > pass.txt
$ ./generate_test_cert.sh
```

The test cert script creates a Certificate Authority, and then signs the local server's certificate with said authority. You can import the certificate authority information into your browser. In Chrome, look for **Manage Certificates** in settings, and import `./certs/ca.pem` under the **Authorities** tab.

## Use

The default config supports the following projects:

- [cap](https://github.com/crkn-rcdr/cap)
- [cihm-cantaloupe](https://github.com/crkn-rcdr/cihm-cantaloupe)
- [sapindale](https://github.com/crkn-rcdr/sapindale)
- [amsa](https://github.com/crkn-rcdr/amsa)

as well as everything in this repository.

If these services are running on your machine, and you've edited your `/etc/hosts` file to point their public domains locally, you should be able to access these services as if they were running in production (i.e. no need to specify ports, etc.). Please check each project for local setup instructions. This config supports adding a suffix to each subdomain, e.g. `auth-dev.canadiana.ca`, if you want to maintain access to both local installations and production installations running at e.g. `auth.canadiana.ca`.
