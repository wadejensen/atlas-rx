#!/bin/bash

set -o errexit
set -o nounset
set -o pipefail

ENCRYPTED_DOCKERHUB_PASSWORD='AQICAHhUjEp+8CCFIY/q4LCQMt4IcEHznznw61ye221S4AwPhwGejeenErY4wC/XnlFg4ggWAAAAgTB/BgkqhkiG9w0BBwagcjBwAgEAMGsGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMjp3wf7jIKY81phTjAgEQgD5glYhuQrwibdrzdKC+H4FHR0PGoFcZmWpZBAB/bt6Ms5k5mBkIYdgQW3eE5jnj0kJzy0FdEMvRYr65/Oku+A=='
ENCRYPTED_MAPS_SERVER_API_KEY='AQICAHgUQFlvK37Z/D78pxApQx/u7yPgVExwfyCL2tJRGJxYxgG8eqzq3LOuwmYKIT+27iwkAAAAhzCBhAYJKoZIhvcNAQcGoHcwdQIBADBwBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDKfJ49RcLCu4ZReKdQIBEIBDLQ6ZAHuel/1LxSHwle6wMx6G4BpCaJ3Hg6BJKwMKorLweAokKyT83TmX9592jEsVvCGaRoRu06YXOK0BlBh5L90QIg=='
ENCRYPTED_MAPS_JAVASCRIPT_API_KEY='AQICAHgRJHLw6IFPE/2//VwIjlotyBUIdNrVgoAXIxmFI/GgwAEuoqUD0tn3O1Lj3s2Bfv/2AAAAhzCBhAYJKoZIhvcNAQcGoHcwdQIBADBwBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDDnpIs1XINubCDIL5QIBEIBDLahsQuVCQN8DXBeEaKavF6nRBJkuBTPBGMvUirGqMATzKL/8Io7jdErfn5OI1Z6tukVL9oWvsuzPwYfuI9JcDw9PnQ=='

function kms_decrypt() {
  local ENCRYPTED_KMS_KEY
  ENCRYPTED_KMS_KEY="$1"
  aws kms decrypt \
    --ciphertext-blob fileb://<(echo "$ENCRYPTED_KMS_KEY" | base64 --decode) \
    --region "ap-southeast-2" \
    --output text \
    --query Plaintext \
    | base64 --decode
}

main() {
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
  add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
  apt-get update
  apt-cache policy docker-ce
  apt-get install -y awscli docker-ce
  systemctl --no-pager status docker

  kms_decrypt "${ENCRYPTED_DOCKERHUB_PASSWORD}" \
    | docker login --username wadejensen --password-stdin

  MAPS_SERVER_API_KEY="$(kms_decrypt "${ENCRYPTED_MAPS_SERVER_API_KEY}")" \
  MAPS_JAVASCRIPT_API_KEY="$(kms_decrypt "${ENCRYPTED_MAPS_JAVASCRIPT_API_KEY}")" \
  docker run \
    -p 3000:3000 \
    --env MAPS_SERVER_API_KEY \
    --env MAPS_JAVASCRIPT_API_KEY \
    wadejensen/atlas:latest \
    > ~/server.log
}

main "$@"
