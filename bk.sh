#!/bin/bash
# usage: bash bk.sh <label>
cd /workspace/qinlove; B=/home/box/sanguo-backup/qinlove; mkdir -p $B; TS=$(date +%Y%m%d_%H%M%S)
node build.js >/dev/null
tar czf $B/${1:-m}_$TS.tgz --ignore-failed-read src ui t/*.js t/all.sh tools assets NOTES.md build.js shell.html bk.sh index.html
cp index.html $B/index_${1:-m}_$TS.html; md5sum index.html > $B/index_${1:-m}_$TS.md5; cat $B/index_${1:-m}_$TS.md5
