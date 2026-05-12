"""SQLite-based dedup + history storage."""
from __future__ import annotations

import hashlib
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Iterator

from .fetcher import Tweet


SCHEMA = """
CREATE TABLE IF NOT EXISTS tweets (
    id_hash      TEXT PRIMARY KEY,
    raw_id       TEXT NOT NULL,
    source       TEXT NOT NULL,
    source_kind  TEXT NOT NULL,
    author       TEXT NOT NULL,
    text         TEXT NOT NULL,
    url          TEXT NOT NULL,
    published_at TEXT NOT NULL,
    seen_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tweets_published ON tweets(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tweets_source ON tweets(source);
"""


def _hash(raw_id: str) -> str:
    return hashlib.sha1(raw_id.encode("utf-8")).hexdigest()


class Storage:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self._init_schema()

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        finally:
            conn.close()

    def _init_schema(self) -> None:
        with self._connect() as conn:
            conn.executescript(SCHEMA)

    def filter_new(self, tweets: Iterable[Tweet]) -> list[Tweet]:
        tweets = list(tweets)
        if not tweets:
            return []
        hashes = [_hash(t.id) for t in tweets]
        placeholders = ",".join("?" for _ in hashes)
        with self._connect() as conn:
            rows = conn.execute(
                f"SELECT id_hash FROM tweets WHERE id_hash IN ({placeholders})",
                hashes,
            ).fetchall()
        existing = {r["id_hash"] for r in rows}
        return [t for t, h in zip(tweets, hashes) if h not in existing]

    def save(self, tweets: Iterable[Tweet]) -> int:
        now = datetime.now(tz=timezone.utc).isoformat()
        records = [
            (
                _hash(t.id),
                t.id,
                t.source,
                t.source_kind,
                t.author,
                t.text,
                t.url,
                t.published.astimezone(timezone.utc).isoformat(),
                now,
            )
            for t in tweets
        ]
        if not records:
            return 0
        with self._connect() as conn:
            conn.executemany(
                """INSERT OR IGNORE INTO tweets
                   (id_hash, raw_id, source, source_kind, author, text, url, published_at, seen_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                records,
            )
        return len(records)

    def latest(self, limit: int = 10) -> list[sqlite3.Row]:
        with self._connect() as conn:
            return conn.execute(
                "SELECT * FROM tweets ORDER BY published_at DESC LIMIT ?",
                (limit,),
            ).fetchall()

    def search(self, query: str, limit: int = 10) -> list[sqlite3.Row]:
        like = f"%{query}%"
        with self._connect() as conn:
            return conn.execute(
                """SELECT * FROM tweets
                   WHERE text LIKE ? OR author LIKE ? OR source LIKE ?
                   ORDER BY published_at DESC LIMIT ?""",
                (like, like, like, limit),
            ).fetchall()

    def count(self) -> int:
        with self._connect() as conn:
            return conn.execute("SELECT COUNT(*) FROM tweets").fetchone()[0]
