# Danny 健身教練 — 原生 App(Expo / React Native)

可上架 App Store / Google Play 的正式版,功能與 `fitness-app/index.html` 網頁版相同:

- 今日課表 + 逐組記錄 + 自動組間休息倒數(含震動提醒)
- 漸進超負荷重量建議(依訓練歷史自動計算)
- 今日訓練充足度判定 + 本週各肌群訓練量 vs 建議區間
- 動作替代推薦
- 飲食紀錄:台灣食物資料庫 + **拍照 AI 營養分析**(Claude 視覺,原生 app 內直接可用,無瀏覽器限制)
- 臥推/深蹲/硬舉重量進展圖
- 訓練日推播提醒(週一/二/四/五,時間可調)
- 資料存在裝置(AsyncStorage),深淺色主題自動切換

## 本機開發預覽(最快)

```bash
cd fitness-app-native
npm install
npx expo start
```

手機裝 [Expo Go](https://expo.dev/go),掃 QR code 即可在真機上跑(推播提醒在 Expo Go 受限,正式建置版才完整)。

## 上架 App Store 步驟

1. **註冊 Apple Developer Program**(https://developer.apple.com,USD 99/年)
2. **註冊 Expo 帳號**(免費,https://expo.dev)並安裝 EAS CLI:
   ```bash
   npm i -g eas-cli
   eas login
   ```
3. **雲端建置 iOS**(不需要 Mac,EAS 會引導你登入 Apple 帳號並自動處理憑證):
   ```bash
   eas build --platform ios --profile production
   ```
4. **提交 App Store**:
   ```bash
   eas submit --platform ios
   ```
   之後到 App Store Connect 填寫 app 資訊(截圖、描述、隱私聲明)送審。
5. 日常更新:改完程式碼重跑 `eas build` + `eas submit`,版號會自動遞增。

> Android / Google Play:`eas build --platform android` + `eas submit --platform android`(需 Google Play 開發者帳號,一次性 USD 25)。

## 送審注意事項

- **拍照 AI 分析**採 BYOK(使用者自備 Anthropic API key)。若要公開上架給一般使用者,建議改為透過你自己的後端代理 API 呼叫,避免要求使用者填 key(Apple 審查對此較敏感);自用/TestFlight 內部測試則無此問題。
- `app.json` 的 `ios.bundleIdentifier`(`com.danny.fitcoach`)可改成你自己的網域反寫。
- 相機/相簿權限描述已在 `app.json` 設好(繁體中文)。

## 專案結構

```
App.js                    根元件:header、tab、全域休息計時器、設定
src/data.js               課表、動作庫(含替代動作)、台灣食物資料庫
src/logic.js              重量建議、充足度判定、週訓練量、營養加總
src/theme.js              深淺色配色(通過色彩可用性驗證)
src/ai.js                 Claude 視覺餐點分析(結構化輸出)
src/notifications.js      每週訓練日推播
src/components.js         共用元件(槓片、卡片、計量條、步進器)
src/screens/              今日 / 課表 / 飲食 / 數據 四個畫面
```
