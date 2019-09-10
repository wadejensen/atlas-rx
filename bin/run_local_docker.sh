#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

export AWS_PROFILE="wjensen"
REPO_ROOT="$(git rev-parse --show-toplevel)"
APP_HOME="${REPO_ROOT}/app"

main() {
  cd "${APP_HOME}"
  docker build -t atlas .

  mkdir -p ~/atlas/log

  docker run \
    --env MAPS_SERVER_API_KEY \
    --env MAPS_JAVASCRIPT_API_KEY \
    -p 3000:3000 atlas \
    > ~/atlas/log/server.log
}

main "$@"
