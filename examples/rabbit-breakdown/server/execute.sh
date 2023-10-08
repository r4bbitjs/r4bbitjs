#!/usr/bin/env bash

kill -9 $(lsof -t -i:3001)
pnpm start

# pnpm i  && pnpm link ../../rabbit-wrapper && pnpm start
