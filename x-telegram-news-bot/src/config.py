"""Configuration loader for the bot."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")


@dataclass
class Settings:
    telegram_bot_token: str
    telegram_chat_id: str
    rss_base_url: str
    fetch_lookback_hours: int
    http_timeout: int
    db_path: Path
    accounts: list[str] = field(default_factory=list)
    keywords: list[str] = field(default_factory=list)
    max_text_length: int = 500
    max_push_per_run: int = 20


def _require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(
            f"環境變數 {name} 未設定。請複製 .env.example 為 .env 並填入值。"
        )
    return value


def load_settings(config_path: Path | None = None) -> Settings:
    config_path = config_path or ROOT / "config.yaml"
    with config_path.open("r", encoding="utf-8") as fh:
        cfg = yaml.safe_load(fh) or {}

    db_env = os.getenv("DB_PATH", "").strip()
    db_path = Path(db_env) if db_env else ROOT / "data" / "news.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)

    return Settings(
        telegram_bot_token=_require_env("TELEGRAM_BOT_TOKEN"),
        telegram_chat_id=_require_env("TELEGRAM_CHAT_ID"),
        rss_base_url=os.getenv("RSS_BASE_URL", "https://rsshub.app").rstrip("/"),
        fetch_lookback_hours=int(os.getenv("FETCH_LOOKBACK_HOURS", "24")),
        http_timeout=int(os.getenv("HTTP_TIMEOUT", "20")),
        db_path=db_path,
        accounts=list(cfg.get("accounts") or []),
        keywords=list(cfg.get("keywords") or []),
        max_text_length=int(cfg.get("max_text_length", 500)),
        max_push_per_run=int(cfg.get("max_push_per_run", 20)),
    )
