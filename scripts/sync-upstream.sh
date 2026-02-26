#!/usr/bin/env bash
# 与官方 openclaw 上游同步
set -euo pipefail

UPSTREAM_REMOTE="upstream"
UPSTREAM_BRANCH="${1:-main}"

git fetch "$UPSTREAM_REMOTE"
git rebase "$UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
echo "已同步到 $UPSTREAM_REMOTE/$UPSTREAM_BRANCH"
