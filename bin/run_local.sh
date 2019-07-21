#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

cd app

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
