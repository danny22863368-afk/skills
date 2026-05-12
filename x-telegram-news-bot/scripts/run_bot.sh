#!/usr/bin/env bash
# 啟動互動式 bot (long-polling). 建議用 tmux / systemd / pm2 保持常駐.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT"

if [[ -d "$ROOT/.venv" ]]; then
    # shellcheck disable=SC1091
    source "$ROOT/.venv/bin/activate"
fi

exec python -m src.bot
