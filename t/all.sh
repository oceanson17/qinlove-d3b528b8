#!/bin/bash
# 全部測試：bash t/all.sh [chromium|webkit]
source /home/box/sanguo-backup/env.sh; cd /workspace/qinlove/t
E=${1:-chromium}; F=0
for f in play1 ai1 story1 kb1; do timeout 400 node $f.js $E 2>&1 | grep -v Skipping | tail -4; [ ${PIPESTATUS[0]} -ne 0 ] && F=1; done
exit $F
