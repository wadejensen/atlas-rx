#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
APP_HOME="${REPO_ROOT}/app"

main() {
  cd "${APP_HOME}"
  KMS_ENCRYPTED_KEY="AQICAHhUjEp+8CCFIY/q4LCQMt4IcEHznznw61ye221S4AwPhwGejeenErY4wC/XnlFg4ggWAAAAgTB/BgkqhkiG9w0BBwagcjBwAgEAMGsGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMjp3wf7jIKY81phTjAgEQgD5glYhuQrwibdrzdKC+H4FHR0PGoFcZmWpZBAB/bt6Ms5k5mBkIYdgQW3eE5jnj0kJzy0FdEMvRYr65/Oku+A=="
  aws kms decrypt \
    --ciphertext-blob fileb://<(echo "$KMS_ENCRYPTED_KEY" | base64 --decode) \
    --region "ap-southeast-2" \
    --output text \
    --query Plaintext \
    | base64 --decode \
    | docker login --username wadejensen --password-stdin

  git_sha=$(git rev-parse --short=8 HEAD)

  docker build -t "wadejensen/atlas:${git_sha}" -t wadejensen/atlas:latest .
  docker push wadejensen/atlas
}

main "$@"
