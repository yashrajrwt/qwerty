#!/bin/sh
set -eu
cd /workspace
node scripts/preview.mjs stop || true
if ! curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8091/health; then
  if [ ! -x /workspace/cpp/nest-backend ]; then
    g++ -O2 -std=c++17 -o /workspace/cpp/nest-backend /workspace/cpp/nest_backend.cpp
  fi
  /workspace/cpp/nest-backend >>/tmp/nest-backend.log 2>&1 &
  i=0
  while [ "$i" -lt 20 ]; do
    if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8091/health; then
      break
    fi
    i=$((i + 1))
    sleep 0.2
  done
fi
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
