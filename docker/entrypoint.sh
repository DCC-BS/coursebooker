#!/bin/sh
set -e

npm run db:migrate
node .output/server/index.mjs