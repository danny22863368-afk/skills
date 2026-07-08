import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { EX, PROGRAM, UNIT_LABEL } from '../data';
import { suggest, adequacy, todayLog, todayKey, restLabel, nextTrainingDay, macroSum } from '../logic';
import { dayTextColor } from '../theme';
import { useApp } from '../store';
import { Card, Plate, Btn, Linky, Stepper, Meter, SectionTitle } from '../components';

function ExerciseCard({ id, index, color }) {
  const { S, update, T, startTimer } = useApp();
  const ex = EX[id];
  const sg = suggest(S, id);
  const logged = todayLog(S, id);
  const [w, setW] = useState(sg.w);
  const [r, setR] = useState(ex.hi);
  const [showAlts, setShowAlts] = useState(false);
  const step = ex.inc || 1;
  const cText = dayTextColor(T, color);
  const done = logged.length >= ex.sets;

  const logSet = () => {
    update((s) => {
      const t = todayKey();
      if (!s.logs[t]) s.logs[t] = {};
      if (!s.logs[t][id]) s.logs[t][id] = [];
      s.logs[t][id].push({ w: +w, r: +r });
    });
    const n = logged.length + 1;
    if (n < ex.sets) startTimer(ex.rest, `${ex.n} 組間休息(${n}/${ex.sets} 組)`);
  };
  const undo = () => update((s) => {
    const t = todayKey();
    if (s.logs[t] && s.logs[t][id]) {
      s.logs[t][id].pop();
      if (!s.logs[t][id].length) delete s.logs[t][id];
    }
  });

  return (
    <Card style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', padding: 13, gap: 10 }}>
        <View style={{ width: 23, height: 23, borderWidth: 1.5, borderColor: T[color], alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
          <Text style={{ fontWeight: '900', fontSize: 12, color: cText }}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15.5, fontWeight: '800', color: T.ink }}>{ex.n}</Text>
          <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 1 }}>
            {ex.hint} · {ex.sets} × {ex.lo === ex.hi ? ex.lo : `${ex.lo}–${ex.hi}`} · 休 {restLabel(ex.rest)}
          </Text>
        </View>
        <Text style={{ fontSize: 12, fontWeight: '800', color: done ? T.good : T.muted, fontVariant: ['tabular-nums'] }}>
          {logged.length}/{ex.sets} 組
        </Text>
      </View>

      <View style={{ marginHorizontal: 13, padding: 10, backgroundColor: T.soft, borderWidth: 1, borderColor: T.line, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <Text style={{ fontSize: 19, fontWeight: '900', color: cText, fontVariant: ['tabular-nums'] }}>
          {sg.trend === 'up' ? '▲ ' : ''}{ex.unit === 'bw' && sg.w === 0 ? '自重' : `${sg.w} ${UNIT_LABEL[ex.unit]}`}
        </Text>
        <Text style={{ fontSize: 12, color: T.muted, flex: 1, minWidth: 120 }}>{sg.note}</Text>
      </View>

      {logged.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 13, paddingTop: 10 }}>
          {logged.map((s, i) => (
            <Text key={i} style={{ fontSize: 12.5, fontWeight: '700', color: T.good, borderWidth: 1.5, borderColor: T.good, paddingHorizontal: 8, paddingVertical: 2, fontVariant: ['tabular-nums'] }}>
              第{i + 1}組 {ex.unit === 'bw' && s.w === 0 ? '自重' : `${s.w}kg`} × {s.r}
            </Text>
          ))}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8, padding: 13, paddingBottom: 10 }}>
        <Stepper value={w} unit={UNIT_LABEL[ex.unit]} onMinus={() => setW((v) => Math.max(0, +(v - step).toFixed(1)))} onPlus={() => setW((v) => +(v + step).toFixed(1))} />
        <Stepper value={r} unit="下" onMinus={() => setR((v) => Math.max(1, v - 1))} onPlus={() => setR((v) => v + 1)} />
        <Btn label="✓ 完成一組" onPress={logSet} style={{ justifyContent: 'center' }} />
      </View>

      <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 13, paddingBottom: 12, flexWrap: 'wrap' }}>
        <Linky label="替代動作" onPress={() => setShowAlts((v) => !v)} />
        <Linky label={`⏱ 手動計時 ${restLabel(ex.rest)}`} onPress={() => startTimer(ex.rest, `${ex.n} 組間休息`)} />
        {logged.length > 0 && <Linky label="撤銷上一組" onPress={undo} />}
      </View>

      {showAlts && (
        <View style={{ marginHorizontal: 13, marginBottom: 12, padding: 10, backgroundColor: T.soft2, borderWidth: 1, borderColor: T.line }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: T.muted, letterSpacing: 1 }}>動作推薦・替代</Text>
          <Text style={{ fontSize: 13, color: T.ink, marginTop: 2 }}>{ex.alts.join('・')}</Text>
        </View>
      )}
    </Card>
  );
}

export default function TodayScreen() {
  const { S, T } = useApp();
  const p = PROGRAM[new Date().getDay()];

  if (!p) {
    const nx = nextTrainingDay();
    const m = macroSum(S);
    return (
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 120 }}>
        <Card style={{ borderStyle: 'dashed', padding: 20, marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: T.ink, marginBottom: 4 }}>今天是休息日 😌</Text>
          <Text style={{ fontSize: 14, color: T.muted, lineHeight: 21 }}>
            讓肌肉恢復、睡滿 7–8 小時,比多練一天更有效。{'\n'}
            下次訓練:<Text style={{ color: dayTextColor(T, nx.color), fontWeight: '800' }}>{nx.label}</Text>
          </Text>
        </Card>
        <SectionTitle>今日營養</SectionTitle>
        <Card style={{ padding: 14 }}>
          <Meter name="蛋白質" val={m.p} target={S.set.p} unit="g" band />
          <Meter name="熱量" val={m.kcal} target={S.set.kcal} unit="kcal" />
        </Card>
      </ScrollView>
    );
  }

  const a = adequacy(S);
  const m = macroSum(S);
  const verdictColor = { good: T.good, warn: T.warn, bad: T.bad }[a.cls];
  const verdictBg = { good: T.goodBg, warn: T.warnBg, bad: T.badBg }[a.cls];

  return (
    <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 120 }}>
      <Card style={{ borderWidth: 2, borderColor: T.ink, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <Plate color={T[p.color]} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17, fontWeight: '900', color: T.ink }}>{p.name}</Text>
          <Text style={{ fontSize: 12.5, color: T.muted }}>{p.sub} · {p.time}</Text>
        </View>
      </Card>

      <View style={{ marginTop: 14, marginBottom: 14, padding: 14, borderLeftWidth: 4, borderLeftColor: verdictColor, backgroundColor: verdictBg }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: T.ink }}>{a.title}</Text>
        <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 2, fontVariant: ['tabular-nums'] }}>
          完成 {a.done}/{a.planned} 組({a.pct}%)· 動作完成 {a.doneEx}/{a.total} · 蛋白質 {Math.round(m.p)}/{S.set.p} g {m.p >= S.set.p ? '✓' : ''}
        </Text>
      </View>

      {p.list.map((id, i) => <ExerciseCard key={id} id={id} index={i} color={p.color} />)}

      <Text style={{ fontSize: 13, color: T.muted, lineHeight: 20, marginTop: 4 }}>{p.note}</Text>
    </ScrollView>
  );
}
