#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

cd app

nodemon \
  --ignore dist \
  --ext ts,js,html,css \
  --exec "npm run package && npm run deploy"
