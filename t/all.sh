#!/bin/bash
# v2 全部測試：bash t/all.sh [chromium|webkit]   （瀏覽器請依次跑，勿並行）
source /home/box/sanguo-backup/env.sh; cd /workspace/qinlove/t
E=${1:-chromium}; F=0
for f in smoke2 rom aim kb2 fate disg chibi portrait say aiq end play_std play_exile play_world; do timeout 600 node $f.js $E 2>&1 | grep -v Skipping | grep -E "^(chromium|webkit|errs)|FAIL" | tail -6; [ ${PIPESTATUS[0]} -ne 0 ] && F=1; done
for s in 1 2; do timeout 600 node monkey.js $E 300 $s 2>&1 | grep -v Skipping | tail -2; [ ${PIPESTATUS[0]} -ne 0 ] && F=1; done
exit $F
