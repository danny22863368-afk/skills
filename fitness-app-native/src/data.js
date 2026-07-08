/* 課表資料(來自 Danny 一週四練・上下肢分化)
   unit: bar=槓鈴總重kg / db=啞鈴每手kg / mc=器械kg / bw=自重(重量欄=附加負重) */
export const EX = {
  bench:    { n: '槓鈴臥推', hint: '當日主項,重量最重', m: '胸', sets: 4, lo: 6, hi: 8, rest: 165, start: 40, inc: 2.5, unit: 'bar', alts: ['啞鈴平板臥推', '史密斯臥推', '胸推機'] },
  incline:  { n: '上斜啞鈴臥推', hint: '上胸', m: '胸', sets: 3, lo: 8, hi: 12, rest: 120, start: 14, inc: 2, unit: 'db', alts: ['上斜槓鈴臥推', '上斜胸推機', '低位繩索夾胸'] },
  latpull:  { n: '滑輪下拉', hint: '背闊肌', m: '背', sets: 3, lo: 8, hi: 12, rest: 120, start: 45, inc: 5, unit: 'mc', alts: ['輔助引體向上', '直臂下拉', '單臂滑輪下拉'] },
  row_s:    { n: '坐姿划船', hint: '中背厚度', m: '背', sets: 3, lo: 10, hi: 12, rest: 90, start: 40, inc: 5, unit: 'mc', alts: ['胸支撐划船', '單臂啞鈴划船', 'T槓划船'] },
  lateral:  { n: '側平舉', hint: '中三角肌', m: '肩', sets: 3, lo: 12, hi: 15, rest: 75, start: 7, inc: 1, unit: 'db', alts: ['繩索側平舉', '機械側平舉'] },
  pushdown: { n: '三頭下壓', hint: '肱三頭肌', m: '三頭', sets: 3, lo: 10, hi: 12, rest: 60, start: 20, inc: 2.5, unit: 'mc', alts: ['過頭繩索伸展', '窄握臥推', '雙槓撐體'] },
  squat:    { n: '槓鈴深蹲', hint: '當日主項', m: '股四', sets: 4, lo: 6, hi: 8, rest: 180, start: 50, inc: 2.5, unit: 'bar', alts: ['高背槓深蹲', '箱上蹲', '腿推機(加重)'] },
  rdl:      { n: '羅馬尼亞硬舉', hint: '腿後鏈', m: '腿後', sets: 3, lo: 8, hi: 10, rest: 150, start: 50, inc: 2.5, unit: 'bar', alts: ['啞鈴RDL', '背伸展', '早安體前屈'] },
  legpress: { n: '腿推機', hint: '股四頭', m: '股四', sets: 3, lo: 10, hi: 12, rest: 120, start: 90, inc: 10, unit: 'mc', alts: ['哈克深蹲', '啞鈴分腿蹲'] },
  legcurl:  { n: '俯臥腿彎舉', hint: '腿後孤立', m: '腿後', sets: 3, lo: 10, hi: 12, rest: 90, start: 30, inc: 5, unit: 'mc', alts: ['坐姿腿彎舉', '瑞士球腿彎舉'] },
  calf:     { n: '站姿提踵', hint: '小腿', m: '小腿', sets: 4, lo: 12, hi: 15, rest: 60, start: 40, inc: 5, unit: 'mc', alts: ['坐姿提踵', '腿推機提踵'] },
  pullup:   { n: '引體向上', hint: '做不到可用輔助機或彈力帶', m: '背', sets: 4, lo: 6, hi: 10, rest: 150, start: 0, inc: 2.5, unit: 'bw', alts: ['滑輪下拉 4×8–10', '離心引體(慢降5秒)', '輔助引體機'] },
  bbrow:    { n: '槓鈴划船', hint: '中背主項', m: '背', sets: 4, lo: 8, hi: 10, rest: 150, start: 40, inc: 2.5, unit: 'bar', alts: ['胸支撐划船', 'Pendlay 划船'] },
  dbbench:  { n: '啞鈴平板臥推', hint: '胸', m: '胸', sets: 3, lo: 8, hi: 12, rest: 120, start: 16, inc: 2, unit: 'db', alts: ['槓鈴臥推', '機械胸推'] },
  pec:      { n: '蝴蝶機夾胸', hint: '胸孤立', m: '胸', sets: 3, lo: 12, hi: 15, rest: 75, start: 35, inc: 5, unit: 'mc', alts: ['繩索夾胸', '啞鈴飛鳥'] },
  facepull: { n: '繩索面拉', hint: '後三角・肩袖健康', m: '後肩', sets: 3, lo: 12, hi: 15, rest: 60, start: 15, inc: 2.5, unit: 'mc', alts: ['反向飛鳥機', '俯身啞鈴飛鳥'] },
  curl:     { n: '啞鈴二頭彎舉', hint: '肱二頭肌', m: '二頭', sets: 3, lo: 10, hi: 12, rest: 60, start: 10, inc: 1, unit: 'db', alts: ['槓鈴彎舉', '斜板彎舉', '錘式彎舉'] },
  dead:     { n: '傳統硬舉', hint: '當日主項,組數少強度高', m: '腿後', sets: 3, lo: 5, hi: 6, rest: 180, start: 60, inc: 5, unit: 'bar', alts: ['六角槓硬舉', '架上拉'] },
  split:    { n: '分腿蹲', hint: '每邊各做,左右算 1 組', m: '股四', sets: 3, lo: 8, hi: 10, rest: 120, start: 10, inc: 2, unit: 'db', alts: ['保加利亞分腿蹲', '弓步走'] },
  legext:   { n: '腿伸展機', hint: '股四頭孤立', m: '股四', sets: 3, lo: 12, hi: 15, rest: 90, start: 35, inc: 5, unit: 'mc', alts: ['西西深蹲', '單腿伸展'] },
  hip:      { n: '槓鈴臀推', hint: '臀大肌', m: '臀', sets: 3, lo: 10, hi: 12, rest: 90, start: 40, inc: 5, unit: 'bar', alts: ['臀推機', '羅馬尼亞硬舉'] },
  legraise: { n: '懸垂舉腿', hint: '核心,做不動改捲腹', m: '核心', sets: 3, lo: 10, hi: 12, rest: 60, start: 0, inc: 0, unit: 'bw', alts: ['捲腹', '死蟲式', '棒式 45–60 秒'] },
};

export const PROGRAM = {
  1: { name: '上半身 A(胸主導)', sub: '胸 10 組・背 6 組・肩三頭收尾', color: 'red', time: '約 65–75 分', list: ['bench', 'incline', 'latpull', 'row_s', 'lateral', 'pushdown'], note: '動作前先熱身 8–10 分鐘:5 分鐘飛輪/跑步機 + 空槓臥推 2 組暖身組。' },
  2: { name: '下半身 A(蹲主導)', sub: '股四頭・腿後・小腿', color: 'blue', time: '約 60–70 分', list: ['squat', 'rdl', 'legpress', 'legcurl', 'calf'], note: '深蹲前務必充分熱身髖與踝關節;第一次做請從空槓開始找動作模式。' },
  4: { name: '上半身 B(背主導)', sub: '背 11 組・胸 6 組・肩二頭收尾', color: 'yellow', time: '約 65–75 分', list: ['pullup', 'bbrow', 'dbbench', 'pec', 'facepull', 'curl'], note: '引體向上若一下都做不到:改用滑輪下拉 4×8–10,每週練習離心引體(慢慢下降 5 秒)。' },
  5: { name: '下半身 B(髖主導)+ 核心', sub: '硬舉・單邊訓練・臀・腹', color: 'green', time: '約 60–70 分', list: ['dead', 'split', 'legext', 'hip', 'legraise'], note: '傳統硬舉與週二的羅馬尼亞硬舉不同:從地面拉起,每一下都可放回地面重新啟動。' },
};

export const DOW = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
export const UNIT_LABEL = { bar: 'kg', db: 'kg/手', mc: 'kg', bw: 'kg 負重' };

export const MUSCLES = [
  { k: '胸', band: [13, 15] }, { k: '背', band: [13, 15] },
  { k: '股四' }, { k: '腿後' }, { k: '臀' }, { k: '肩' }, { k: '後肩' },
  { k: '二頭' }, { k: '三頭' }, { k: '小腿' }, { k: '核心' },
];

/* 食物資料庫(常見台灣食物) u:'g' → 每100g;u:'份' → 每份。 q = 預設份量 */
export const FOOD_DB = [
  { n: '雞胸肉(熟)', u: 'g', q: 150, kcal: 165, p: 31, c: 0, f: 3.6 },
  { n: '去皮雞腿肉(熟)', u: 'g', q: 120, kcal: 155, p: 24, c: 0, f: 6 },
  { n: '豬里肌(熟)', u: 'g', q: 120, kcal: 143, p: 26, c: 0, f: 4 },
  { n: '牛腱/瘦牛肉(熟)', u: 'g', q: 120, kcal: 175, p: 28, c: 0, f: 7 },
  { n: '鮭魚(熟)', u: 'g', q: 120, kcal: 208, p: 20, c: 0, f: 13 },
  { n: '鯛魚片(熟)', u: 'g', q: 120, kcal: 100, p: 21, c: 0, f: 1.5 },
  { n: '白飯', u: 'g', q: 250, kcal: 130, p: 2.7, c: 28, f: 0.3 },
  { n: '糙米飯', u: 'g', q: 250, kcal: 112, p: 2.6, c: 24, f: 0.9 },
  { n: '地瓜', u: 'g', q: 200, kcal: 86, p: 1.6, c: 20, f: 0.1 },
  { n: '燕麥(乾)', u: 'g', q: 60, kcal: 389, p: 17, c: 66, f: 7 },
  { n: '全麥吐司', u: '份', q: 1, kcal: 75, p: 3.5, c: 13, f: 1, note: '1片' },
  { n: '雞蛋', u: '份', q: 2, kcal: 78, p: 6.9, c: 0.4, f: 5.2, note: '1顆' },
  { n: '茶葉蛋', u: '份', q: 1, kcal: 75, p: 7, c: 1, f: 5, note: '1顆' },
  { n: '乳清蛋白', u: '份', q: 1, kcal: 120, p: 24, c: 3, f: 1.5, note: '1匙30g' },
  { n: '無糖豆漿', u: 'g', q: 400, kcal: 33, p: 3.6, c: 1.5, f: 1.6 },
  { n: '鮮奶', u: 'g', q: 290, kcal: 63, p: 3.1, c: 4.8, f: 3.6 },
  { n: '無糖希臘優格', u: 'g', q: 170, kcal: 59, p: 10, c: 3.6, f: 0.4 },
  { n: '香蕉', u: '份', q: 1, kcal: 105, p: 1.3, c: 27, f: 0.4, note: '1根' },
  { n: '蘋果', u: '份', q: 1, kcal: 95, p: 0.5, c: 25, f: 0.3, note: '1顆' },
  { n: '堅果', u: 'g', q: 30, kcal: 607, p: 20, c: 21, f: 54 },
  { n: '花椰菜(熟)', u: 'g', q: 150, kcal: 35, p: 2.4, c: 7, f: 0.4 },
  { n: '雞腿便當', u: '份', q: 1, kcal: 850, p: 35, c: 100, f: 35 },
  { n: '排骨便當', u: '份', q: 1, kcal: 900, p: 30, c: 105, f: 40 },
  { n: '滷肉飯(1碗)', u: '份', q: 1, kcal: 500, p: 15, c: 70, f: 17 },
  { n: '牛肉麵(1碗)', u: '份', q: 1, kcal: 600, p: 30, c: 75, f: 18 },
  { n: '鮪魚御飯糰', u: '份', q: 1, kcal: 210, p: 6, c: 37, f: 4 },
  { n: '地瓜(超商中)', u: '份', q: 1, kcal: 180, p: 3, c: 42, f: 0.2 },
  { n: '無糖拿鐵(中杯)', u: '份', q: 1, kcal: 110, p: 6, c: 9, f: 5.5 },
];
