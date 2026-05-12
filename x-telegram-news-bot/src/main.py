"""Cron 入口: 抓取最新推文 -> 去重 -> 推播到 Telegram."""
from __future__ import annotations

import argparse
import logging
import time

from .config import load_settings
from .fetcher import fetch_all
from .formatter import render_tweet
from .storage import Storage
from .telegram_client import TelegramClient


def configure_logging(verbose: bool) -> None:
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
    )


def run_once(dry_run: bool = False) -> int:
    settings = load_settings()
    storage = Storage(settings.db_path)

    fetched = fetch_all(
        base_url=settings.rss_base_url,
        accounts=settings.accounts,
        keywords=settings.keywords,
        timeout=settings.http_timeout,
        lookback_hours=settings.fetch_lookback_hours,
    )
    logging.info("fetched %d tweets across %d accounts + %d keywords",
                 len(fetched), len(settings.accounts), len(settings.keywords))

    fresh = storage.filter_new(fetched)
    logging.info("%d new tweets after dedup", len(fresh))
    if not fresh:
        return 0

    fresh = fresh[: settings.max_push_per_run]

    if dry_run:
        for tw in fresh:
            print("---")
            print(render_tweet(tw, settings.max_text_length))
        return len(fresh)

    client = TelegramClient(
        token=settings.telegram_bot_token,
        default_chat_id=settings.telegram_chat_id,
        timeout=settings.http_timeout,
    )

    pushed: list = []
    for tw in fresh:
        try:
            client.send_message(render_tweet(tw, settings.max_text_length))
            pushed.append(tw)
            time.sleep(1.0)  # 善待 Telegram rate limit
        except Exception as exc:  # noqa: BLE001
            logging.error("push failed for %s: %s", tw.id, exc)
            break

    saved = storage.save(pushed)
    logging.info("pushed=%d saved=%d", len(pushed), saved)
    return len(pushed)


def main() -> None:
    parser = argparse.ArgumentParser(description="抓取 X AI 新聞並推播到 Telegram")
    parser.add_argument("--dry-run", action="store_true", help="只列印, 不推播也不寫入 DB")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()
    configure_logging(args.verbose)
    run_once(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
