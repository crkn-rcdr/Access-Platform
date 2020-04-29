#!/bin/sh

DIR=`dirname "$0"`

openssl req -x509 \
  -newkey rsa:4096 \
  -sha256 \
  -days 365 \
  -nodes \
  -keyout $DIR/localhost.key \
  -out $DIR/localhost.crt \
  -subj /CN=localhost \
  -addext subjectAltName=DNS:*.canadiana.ca

cat $DIR/localhost.crt $DIR/localhost.key > $DIR/localhost.pem