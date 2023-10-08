#!/usr/bin/env bash

kill -9 $(lsof -t -i:3000)
pnpm start

# pnpm i  && pnpm link ../../rabbit-wrapper && pnpm start
