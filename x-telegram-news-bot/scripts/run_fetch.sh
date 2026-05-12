#!/usr/bin/env bash
# 推薦寫進 crontab, 例如每 30 分鐘抓一次:
#   */30 * * * * /path/to/x-telegram-news-bot/scripts/run_fetch.sh >> /path/to/x-telegram-news-bot/data/cron.log 2>&1
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT"

if [[ -d "$ROOT/.venv" ]]; then
    # shellcheck disable=SC1091
    source "$ROOT/.venv/bin/activate"
fi

exec python -m src.main "$@"
