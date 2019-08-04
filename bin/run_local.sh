#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
APP_HOME="${REPO_ROOT}/app"

cd "${APP_HOME}"

# Build frontend in watch mode
nodemon \
  --ignore dist \
  --ignore static \
  --ignore server \
  --watch web/src \
  --ext ts \
  --exec "npm run build:web:dev" &

# Build and deploy backend in watch mode
nodemon \
  --ignore dist \
  --ignore static \
  --ignore web \
  --watch server/src \
  --ext ts \
  --exec "npm run build:server:dev && npm run deploy"
