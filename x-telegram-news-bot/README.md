# x-telegram-news-bot

從 X (Twitter) 透過 **RSSHub / Nitter** 抓取 AI 相關推文,去重後推播到你的 Telegram。
同時提供一個互動式 Telegram bot,可隨時用指令查詢已收錄內容。

## 功能

- 帳號追蹤:`OpenAI`、`AnthropicAI`、`GoogleDeepMind`、`sama` 等 (可自訂)
- 關鍵字搜尋:`Claude`、`GPT-5`、`LLM` 等 (可自訂)
- SQLite 去重,不會重複轉貼同一篇
- Telegram 推播 (HTML 格式 + 原連結)
- 互動指令:`/latest`、`/search`、`/sources`、`/stats`
- 本機 cron 排程,免上雲

## 架構

```
fetcher (RSSHub/Nitter)  ->  Tweet model  ->  Storage (SQLite, 去重)  ->  Telegram push
                                                     |
                                                     +--->  bot.py (long-polling, /latest /search ...)
```

## 安裝

```bash
git clone <repo>
cd x-telegram-news-bot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
$EDITOR .env          # 填入 TELEGRAM_BOT_TOKEN 與 TELEGRAM_CHAT_ID
$EDITOR config.yaml   # 自訂追蹤帳號與關鍵字
```

### 取得 Telegram 憑證

1. 在 Telegram 找 `@BotFather` → `/newbot` → 取得 `TELEGRAM_BOT_TOKEN`
2. 把 bot 加入你要接收訊息的對話 (個人對話直接私訊 `/start`,群組要加 bot 進去)
3. 開啟 `https://api.telegram.org/bot<TOKEN>/getUpdates`,從 JSON 裡找 `chat.id`,填到 `TELEGRAM_CHAT_ID`

### RSSHub / Nitter 來源

預設使用公開 `https://rsshub.app`,免費但偶爾不穩。若需要更穩可:

- 自架 RSSHub:<https://docs.rsshub.app/install/>
- 自架 Nitter:<https://github.com/zedeus/nitter>
- 把 `.env` 的 `RSS_BASE_URL` 改成你的實例網址

## 使用

### 1. 先 dry-run 測試抓取

```bash
python -m src.main --dry-run -v
```

會把抓到的內容直接印出來,不會推播也不會寫入 DB,方便驗證。

### 2. 實際推播一次

```bash
python -m src.main
```

### 3. 設定 cron

把 `scripts/crontab.example` 內容改完路徑後加進 `crontab -e`,例如:

```cron
*/30 * * * * /home/me/x-telegram-news-bot/scripts/run_fetch.sh >> /home/me/x-telegram-news-bot/data/cron.log 2>&1
```

### 4. 啟動互動 bot (可選)

```bash
./scripts/run_bot.sh
```

可丟進 tmux / systemd 常駐。bot 只接受 `TELEGRAM_CHAT_ID` 對應的對話送出的指令。

## Telegram 指令

| 指令 | 用途 |
|---|---|
| `/latest [n]` | 顯示資料庫中最新 n 則 (1–20,預設 5) |
| `/search 關鍵字` | 在已收錄推文中以 LIKE 搜尋 |
| `/sources` | 列出目前追蹤的帳號與關鍵字 |
| `/stats` | 顯示資料庫總數與路徑 |
| `/help` | 顯示指令說明 |

## 設定參考

`config.yaml`:

```yaml
accounts:
  - OpenAI
  - AnthropicAI
keywords:
  - "Claude"
  - "GPT-5"
max_text_length: 500     # 單則訊息最大字數
max_push_per_run: 20     # 一次 cron 推幾則 (防 rate limit)
```

`.env`:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
RSS_BASE_URL=https://rsshub.app
FETCH_LOOKBACK_HOURS=24
HTTP_TIMEOUT=20
```

## 注意事項

- 公開 RSSHub 偶爾會被 X 限制,失敗時 fetcher 會 fallback 到 Nitter 路徑。長期建議自架。
- Telegram 對單 bot 的訊息頻率限制大約是 30 msg/sec,本專案保守每則 sleep 1 秒。
- 第一次跑會把過去 `FETCH_LOOKBACK_HOURS` 小時內所有貼文視為新貼文,可能一次推很多;建議先用 `--dry-run` 確認。

## License

MIT
