"""長駐互動式 Telegram bot, 支援 /latest /search /sources /stats /help."""
from __future__ import annotations

import logging

from telegram import Update
from telegram.constants import ParseMode
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)

from .config import Settings, load_settings
from .formatter import render_row
from .storage import Storage

log = logging.getLogger(__name__)

HELP_TEXT = (
    "<b>X AI News Bot</b>\n\n"
    "/latest [n]  — 顯示最新 n 則 (預設 5, 上限 20)\n"
    "/search 關鍵字  — 在已收錄推文中搜尋\n"
    "/sources  — 列出目前追蹤的帳號與關鍵字\n"
    "/stats  — 資料庫統計\n"
    "/help  — 顯示這個說明\n"
)


def _require_authorized(settings: Settings, update: Update) -> bool:
    chat = update.effective_chat
    if chat and str(chat.id) == str(settings.telegram_chat_id):
        return True
    log.warning("unauthorized chat_id=%s blocked", chat.id if chat else None)
    return False


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    settings: Settings = context.application.bot_data["settings"]
    if not _require_authorized(settings, update):
        return
    await update.message.reply_html(HELP_TEXT)


async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await cmd_start(update, context)


async def cmd_latest(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    settings: Settings = context.application.bot_data["settings"]
    storage: Storage = context.application.bot_data["storage"]
    if not _require_authorized(settings, update):
        return

    n = 5
    if context.args:
        try:
            n = max(1, min(20, int(context.args[0])))
        except ValueError:
            await update.message.reply_text("用法: /latest [數字]")
            return

    rows = storage.latest(limit=n)
    if not rows:
        await update.message.reply_text("尚未收錄任何推文,先讓 cron 跑一輪試試。")
        return
    for row in rows:
        await update.message.reply_html(
            render_row(row, settings.max_text_length),
            disable_web_page_preview=False,
        )


async def cmd_search(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    settings: Settings = context.application.bot_data["settings"]
    storage: Storage = context.application.bot_data["storage"]
    if not _require_authorized(settings, update):
        return

    if not context.args:
        await update.message.reply_text("用法: /search 關鍵字")
        return
    query = " ".join(context.args)
    rows = storage.search(query, limit=10)
    if not rows:
        await update.message.reply_text(f'沒找到「{query}」的相關推文。')
        return
    for row in rows:
        await update.message.reply_html(
            render_row(row, settings.max_text_length),
            disable_web_page_preview=False,
        )


async def cmd_sources(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    settings: Settings = context.application.bot_data["settings"]
    if not _require_authorized(settings, update):
        return
    accounts = "\n".join(f"• @{a}" for a in settings.accounts) or "(無)"
    keywords = "\n".join(f"• {k}" for k in settings.keywords) or "(無)"
    msg = (
        f"<b>追蹤帳號</b>\n{accounts}\n\n"
        f"<b>追蹤關鍵字</b>\n{keywords}"
    )
    await update.message.reply_html(msg)


async def cmd_stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    settings: Settings = context.application.bot_data["settings"]
    storage: Storage = context.application.bot_data["storage"]
    if not _require_authorized(settings, update):
        return
    total = storage.count()
    await update.message.reply_html(
        f"目前資料庫收錄 <b>{total}</b> 則推文。\n"
        f"DB: <code>{settings.db_path}</code>"
    )


def build_app(settings: Settings | None = None) -> Application:
    settings = settings or load_settings()
    storage = Storage(settings.db_path)

    app = Application.builder().token(settings.telegram_bot_token).build()
    app.bot_data["settings"] = settings
    app.bot_data["storage"] = storage

    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("latest", cmd_latest))
    app.add_handler(CommandHandler("search", cmd_search))
    app.add_handler(CommandHandler("sources", cmd_sources))
    app.add_handler(CommandHandler("stats", cmd_stats))
    return app


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
    )
    app = build_app()
    log.info("bot 啟動中, 等待指令...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
