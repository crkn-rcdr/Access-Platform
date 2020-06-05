# Haproxy configuration

To set this up (from this directory):

```
$ cp haproxy.cfg.example haproxy.cfg
$ echo whatevertextyoulike > pass.txt
$ ./generate_test_cert.sh
$ cd ..
$ docker-compose up
```

The test cert script creates a Certificate Authority, and then signs the local server's certificate with said authority. You can import the certificate authority information into your browser. In Chrome, look for **Manage Certificates** in settings, and import `./certs/ca.pem` under the **Authorities** tab.

The HAProxy config should work out of the box, although feel free to meddle with it (which is why `haproxy.cfg` is in `.gitignore`). Default Docker network configs for Access platform repos will assume that HAProxy is running on your machine.
