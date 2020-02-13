# Haproxy configuration

To set this up (from this directory):

```
$ cp haproxy.cfg.example haproxy.cfg
$ ./generate_test_cert.sh
$ cd ..
$ docker-compose up
```

The HAProxy config should work out of the box, although feel free to meddle with it (which is why `haproxy.cfg` is in `.gitignore`). Default Docker network configs for Access platform repos will assume that HAProxy is running on your machine.
