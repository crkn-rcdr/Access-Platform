#!/bin/sh

DIR=`dirname "$0"`/certs
mkdir -p $DIR

# create a config file for the signed certificate
>$DIR/canadiana.ext cat <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = *.canadiana.ca
EOF

# generate private key for CA
openssl genrsa -des3 -passout file:pass.txt -out $DIR/ca.key 4096
# generate CA cert
openssl req -x509 -new -nodes -key $DIR/ca.key -sha256 -days 3650 -passin file:pass.txt -subj "/CN=canadiana.ca" -out $DIR/ca.pem

# generate key for domain cert
openssl genrsa -out $DIR/canadiana.key 4096
# generate certificate signing request
openssl req -new -key $DIR/canadiana.key -subj "/CN=canadiana.ca" -out $DIR/canadiana.csr
# generate the signed certificate
openssl x509 -req -in $DIR/canadiana.csr -CA $DIR/ca.pem -CAkey $DIR/ca.key -passin file:pass.txt -CAcreateserial \
-out $DIR/canadiana.crt -days 825 -sha256 -extfile $DIR/canadiana.ext

cat $DIR/canadiana.crt $DIR/canadiana.key > $DIR/canadiana.pem