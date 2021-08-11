#!/bin/sh

docker login docker.c7a.ca

if [ "$?" -ne "0" ]; then
  echo 
  echo "Error logging into the c7a Docker registry."
  exit 1
fi

TAG=`date -u +"%Y%m%d%H%M%S"`

echo
echo "Tagging access-platform:prod as docker.c7a.ca/access-platform:$TAG"

docker tag access-platform:prod docker.c7a.ca/access-platform:$TAG

if [ "$?" -ne "0" ]; then
  exit $?
fi

echo
echo "Pushing docker.c7a.ca/access-platform:$TAG"

docker push docker.c7a.ca/access-platform:$TAG

if [ "$?" -ne "0" ]; then
  exit $?
fi

echo
echo "Push sucessful. Create a new issue at:"
echo
echo "https://github.com/crkn-rcdr/Systems-Administration/issues/new?title=New+Access+Platform+image:+%60docker.c7a.ca/access-platform:$TAG%60&body=Please+describe+the+changes+in+this+update%2e"
echo
echo "to alert the systems team. Don't forget to describe what's new!"