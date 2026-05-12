"""從 Nitter / RSSHub 抓取 X (Twitter) 推文。"""
from __future__ import annotations

import logging
import re
import time
from dataclasses import dataclass
from datetime import datetime, timezone, timedelta
from urllib.parse import quote

import feedparser
import requests

log = logging.getLogger(__name__)

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")


@dataclass(frozen=True)
class Tweet:
    id: str          # 穩定識別字串 (entry id 或 link)
    source: str      # account name 或 keyword
    source_kind: str # "account" | "keyword"
    author: str
    text: str
    url: str
    published: datetime

    def short_text(self, limit: int) -> str:
        if len(self.text) <= limit:
            return self.text
        return self.text[: limit - 1].rstrip() + "…"


def _clean(html: str) -> str:
    text = _TAG_RE.sub(" ", html or "")
    return _WS_RE.sub(" ", text).strip()


def _parse_dt(entry) -> datetime:
    for key in ("published_parsed", "updated_parsed"):
        value = getattr(entry, key, None) or entry.get(key)
        if value:
            return datetime.fromtimestamp(time.mktime(value), tz=timezone.utc)
    return datetime.now(tz=timezone.utc)


def _fetch_feed(url: str, timeout: int) -> feedparser.FeedParserDict:
    log.info("fetching %s", url)
    # feedparser 不支援 timeout, 改用 requests 取回再 parse
    resp = requests.get(
        url,
        timeout=timeout,
        headers={"User-Agent": "x-telegram-news-bot/1.0 (+https://github.com)"},
    )
    resp.raise_for_status()
    return feedparser.parse(resp.content)


def _entries_to_tweets(
    feed: feedparser.FeedParserDict,
    source: str,
    source_kind: str,
    cutoff: datetime,
) -> list[Tweet]:
    tweets: list[Tweet] = []
    for entry in feed.entries:
        published = _parse_dt(entry)
        if published < cutoff:
            continue
        link = entry.get("link") or ""
        eid = entry.get("id") or link
        if not eid:
            continue
        author = entry.get("author") or source
        text = _clean(entry.get("summary") or entry.get("title") or "")
        if not text:
            continue
        tweets.append(
            Tweet(
                id=eid,
                source=source,
                source_kind=source_kind,
                author=author,
                text=text,
                url=link,
                published=published,
            )
        )
    return tweets


def fetch_account(base_url: str, account: str, timeout: int, lookback_hours: int) -> list[Tweet]:
    """RSSHub: /twitter/user/<account>   Nitter: /<account>/rss"""
    cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=lookback_hours)
    url = f"{base_url}/twitter/user/{quote(account)}"
    try:
        feed = _fetch_feed(url, timeout=timeout)
    except Exception as exc:  # noqa: BLE001
        # 退一步試 Nitter 形式
        log.warning("RSSHub fetch failed for %s (%s); trying Nitter path", account, exc)
        try:
            feed = _fetch_feed(f"{base_url}/{quote(account)}/rss", timeout=timeout)
        except Exception as exc2:  # noqa: BLE001
            log.error("Nitter fetch failed for %s: %s", account, exc2)
            return []
    return _entries_to_tweets(feed, account, "account", cutoff)


def fetch_keyword(base_url: str, keyword: str, timeout: int, lookback_hours: int) -> list[Tweet]:
    """RSSHub: /twitter/keyword/<word>"""
    cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=lookback_hours)
    url = f"{base_url}/twitter/keyword/{quote(keyword)}"
    try:
        feed = _fetch_feed(url, timeout=timeout)
    except Exception as exc:  # noqa: BLE001
        log.error("keyword fetch failed for %s: %s", keyword, exc)
        return []
    return _entries_to_tweets(feed, keyword, "keyword", cutoff)


def fetch_all(
    base_url: str,
    accounts: list[str],
    keywords: list[str],
    timeout: int,
    lookback_hours: int,
) -> list[Tweet]:
    seen_ids: set[str] = set()
    results: list[Tweet] = []
    for account in accounts:
        for tw in fetch_account(base_url, account, timeout, lookback_hours):
            if tw.id in seen_ids:
                continue
            seen_ids.add(tw.id)
            results.append(tw)
    for keyword in keywords:
        for tw in fetch_keyword(base_url, keyword, timeout, lookback_hours):
            if tw.id in seen_ids:
                continue
            seen_ids.add(tw.id)
            results.append(tw)
    results.sort(key=lambda t: t.published)
    return results
