import * as ImageManipulator from 'expo-image-manipulator';

/* 縮圖並轉 base64(控制上傳大小與費用) */
export async function shrinkImage(uri) {
  const r = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1120 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return r.base64;
}

const SCHEMA = {
  type: 'object',
  properties: {
    foods: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: '食物名稱(繁體中文)' },
          portion: { type: 'string', description: '估計份量描述,如 150g、1碗' },
          kcal: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
        },
        required: ['name', 'portion', 'kcal', 'protein', 'carbs', 'fat'],
        additionalProperties: false,
      },
    },
    note: { type: 'string', description: '一句話備註,如信心程度或建議' },
  },
  required: ['foods', 'note'],
  additionalProperties: false,
};

/* Claude 視覺分析餐點照片 → 結構化營養資料 */
export async function analyzeMealPhoto(apiKey, imageUri) {
  const b64 = await shrinkImage(imageUri);
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } },
            { type: 'text', text: '這是一位台灣使用者的餐點照片。請辨識照片中每項食物,以台灣常見份量估算每項的重量與營養素(kcal、蛋白質、碳水、脂肪,單位公克)。份量不確定時取中間值。' },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    let msg = '請檢查 API key 是否正確';
    try { const e = await res.json(); if (e.error && e.error.message) msg = e.error.message; } catch (_) {}
    throw new Error(`API ${res.status}:${msg}`);
  }
  const data = await res.json();
  if (data.stop_reason === 'refusal') throw new Error('模型拒絕了這次請求,請換一張照片試試。');
  const textBlock = data.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('AI 沒有回傳結果,請再試一次。');
  return JSON.parse(textBlock.text);
}
