#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

cd app

# Build frontend in watch mode
nodemon \
  --ignore dist \
  --ignore static \
  --watch web/src \
  --ext ts \
  --exec "npm run build:web:dev" &

# Build and deploy backend in watch mode
nodemon \
  --ignore dist \
  --ignore static \
  --ext ts,js,html,css \
  --exec "npm run build:server:dev && npm run deploy"
