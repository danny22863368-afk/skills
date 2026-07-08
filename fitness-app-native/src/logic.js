import { EX, PROGRAM, UNIT_LABEL, DOW } from './data';

export function todayKey(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function lastSession(S, exId) {
  const t = todayKey();
  const dates = Object.keys(S.logs)
    .filter((d) => d !== t && S.logs[d][exId] && S.logs[d][exId].length)
    .sort()
    .reverse();
  if (!dates.length) return null;
  return { date: dates[0], sets: S.logs[dates[0]][exId] };
}

/* 重量建議:漸進超負荷 —— 上次全組達到次數上限 → 加重;有組數低於下限 → 維持鞏固 */
export function suggest(S, exId) {
  const ex = EX[exId];
  const hist = lastSession(S, exId);
  if (!hist) {
    if (ex.unit === 'bw') return { w: 0, note: '先做自重,行有餘力再負重', trend: 'new' };
    return { w: ex.start, note: '建議起始重量,以能標準完成為準', trend: 'new' };
  }
  const w = Math.max(...hist.sets.map((s) => s.w));
  const enough = hist.sets.length >= ex.sets;
  const allTop = enough && hist.sets.every((s) => s.r >= ex.hi);
  const anyLow = hist.sets.some((s) => s.r < ex.lo);
  const d = hist.date.slice(5).replace('-', '/');
  if (allTop && ex.inc > 0) return { w: +(w + ex.inc).toFixed(1), note: `上次(${d})全數達標 → 加重 ${ex.inc} kg`, trend: 'up' };
  if (anyLow) return { w, note: `上次(${d})有組數未達下限 → 維持重量鞏固`, trend: 'hold' };
  return { w, note: `維持 ${w}${UNIT_LABEL[ex.unit]},往次數上限 ${ex.hi} 下推進`, trend: 'push' };
}

export function todayLog(S, exId) {
  const t = S.logs[todayKey()];
  return (t && t[exId]) || [];
}

/* 本週(週一起算)每個肌群完成組數 */
export function weekVolume(S) {
  const now = new Date();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  mon.setHours(0, 0, 0, 0);
  const vol = {};
  for (const d in S.logs) {
    const dt = new Date(d + 'T12:00:00');
    if (dt >= mon && dt <= now) {
      for (const exId in S.logs[d]) {
        const m = EX[exId] ? EX[exId].m : null;
        if (m) vol[m] = (vol[m] || 0) + S.logs[d][exId].length;
      }
    }
  }
  return vol;
}

/* 今日充足度 */
export function adequacy(S) {
  const p = PROGRAM[new Date().getDay()];
  if (!p) return null;
  let planned = 0, done = 0, doneEx = 0;
  p.list.forEach((id) => {
    planned += EX[id].sets;
    const n = todayLog(S, id).length;
    done += Math.min(n, EX[id].sets);
    if (n >= EX[id].sets) doneEx++;
  });
  const pct = planned ? Math.round((done / planned) * 100) : 0;
  let cls = 'bad', title = '今日訓練量不足';
  if (pct >= 100) { cls = 'good'; title = '今日訓練充足,收工!'; }
  else if (pct >= 90) { cls = 'good'; title = '今日訓練大致充足'; }
  else if (pct >= 55) { cls = 'warn'; title = '還差一點,再撐幾組'; }
  return { pct, done, planned, doneEx, total: p.list.length, cls, title };
}

export function nextTrainingDay() {
  const d = new Date();
  for (let i = 1; i <= 7; i++) {
    const g = (d.getDay() + i) % 7;
    if (PROGRAM[g]) return { label: `${DOW[g]}|${PROGRAM[g].name}`, color: PROGRAM[g].color };
  }
}

export function todayFood(S) {
  return S.food[todayKey()] || [];
}

export function macroSum(S) {
  return todayFood(S).reduce(
    (a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.p, c: a.c + f.c, f: a.f + f.f }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
}

export function restLabel(sec) {
  return sec >= 60 ? (sec % 60 ? (sec / 60).toFixed(1).replace('.0', '') + ' 分' : sec / 60 + ' 分') : sec + ' 秒';
}
