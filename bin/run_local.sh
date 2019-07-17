#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

cd app

nodemon \
  --ignore dist \
  --ignore static \
  --ext ts,js,html,css \
  --exec "npm run dev-loop && npm run deploy"
