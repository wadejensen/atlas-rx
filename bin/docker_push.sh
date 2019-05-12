#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

cd app

KMS_ENCRYPTED_KEY="AQICAHhUjEp+8CCFIY/q4LCQMt4IcEHznznw61ye221S4AwPhwGejeenErY4wC/XnlFg4ggWAAAAgTB/BgkqhkiG9w0BBwagcjBwAgEAMGsGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMjp3wf7jIKY81phTjAgEQgD5glYhuQrwibdrzdKC+H4FHR0PGoFcZmWpZBAB/bt6Ms5k5mBkIYdgQW3eE5jnj0kJzy0FdEMvRYr65/Oku+A=="
echo "$KMS_ENCRYPTED_KEY" | base64 --decode > encrypted.key
DOCKER_HUB_PW="$(aws kms decrypt \
  --profile wjensen \
  --ciphertext-blob fileb://encrypted.key \
  --output text \
  --query Plaintext \
  | base64 --decode)"
echo "$DOCKER_HUB_PW" | docker login --username wadejensen --password-stdin

git_sha=$(git rev-parse --short=8 HEAD)

docker build -t "atlas:$git_sha" -t atlas:latest .
docker push wadejensen/atlas
