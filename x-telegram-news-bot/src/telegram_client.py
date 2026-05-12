"""輕量 Telegram HTTP client, 用於 cron 模式推播 (不依賴 long-polling)."""
from __future__ import annotations

import logging
import time

import requests

log = logging.getLogger(__name__)

API_BASE = "https://api.telegram.org"


class TelegramClient:
    def __init__(self, token: str, default_chat_id: str, timeout: int = 20):
        self.token = token
        self.default_chat_id = default_chat_id
        self.timeout = timeout
        self.session = requests.Session()

    def _url(self, method: str) -> str:
        return f"{API_BASE}/bot{self.token}/{method}"

    def send_message(self, text: str, chat_id: str | None = None) -> None:
        payload = {
            "chat_id": chat_id or self.default_chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": False,
        }
        for attempt in range(3):
            resp = self.session.post(self._url("sendMessage"), data=payload, timeout=self.timeout)
            if resp.status_code == 429:
                retry = int(resp.json().get("parameters", {}).get("retry_after", 5))
                log.warning("Telegram 429, sleeping %ss", retry)
                time.sleep(retry)
                continue
            if not resp.ok:
                log.error("Telegram send failed: %s %s", resp.status_code, resp.text)
                resp.raise_for_status()
            return
        raise RuntimeError("Telegram send_message exceeded retry budget")
