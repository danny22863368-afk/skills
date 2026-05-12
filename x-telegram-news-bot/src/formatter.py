"""把 Tweet 渲染成 Telegram HTML 訊息。"""
from __future__ import annotations

import html
import sqlite3
from datetime import datetime

from .fetcher import Tweet


def _escape(text: str) -> str:
    return html.escape(text, quote=False)


def render_tweet(tw: Tweet, max_len: int = 500) -> str:
    tag = "📰" if tw.source_kind == "account" else "🔎"
    source_label = f"@{tw.source}" if tw.source_kind == "account" else f'"{tw.source}"'
    when = tw.published.strftime("%Y-%m-%d %H:%M UTC")
    body = _escape(tw.short_text(max_len))
    link = _escape(tw.url) if tw.url else ""
    parts = [
        f"{tag} <b>{_escape(source_label)}</b>  <i>{_escape(when)}</i>",
        f"<b>{_escape(tw.author)}</b>",
        body,
    ]
    if link:
        parts.append(f'<a href="{link}">在 X 開啟</a>')
    return "\n\n".join(parts)


def render_row(row: sqlite3.Row, max_len: int = 500) -> str:
    published = datetime.fromisoformat(row["published_at"])
    tag = "📰" if row["source_kind"] == "account" else "🔎"
    source = row["source"]
    source_label = f"@{source}" if row["source_kind"] == "account" else f'"{source}"'
    text = row["text"]
    if len(text) > max_len:
        text = text[: max_len - 1].rstrip() + "…"
    parts = [
        f"{tag} <b>{_escape(source_label)}</b>  <i>{_escape(published.strftime('%Y-%m-%d %H:%M UTC'))}</i>",
        f"<b>{_escape(row['author'])}</b>",
        _escape(text),
    ]
    if row["url"]:
        parts.append(f'<a href="{_escape(row["url"])}">在 X 開啟</a>')
    return "\n\n".join(parts)
