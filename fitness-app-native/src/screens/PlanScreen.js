import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { EX, PROGRAM, DOW } from '../data';
import { restLabel } from '../logic';
import { dayTextColor } from '../theme';
import { useApp } from '../store';
import { Card, Plate, SectionTitle } from '../components';
import { enableWeeklyReminders, disableReminders } from '../notifications';

function DayCard({ g }) {
  const { T } = useApp();
  const p = PROGRAM[g];
  const [open, setOpen] = useState(g === new Date().getDay());
  return (
    <Card style={{ marginBottom: 12 }}>
      <Pressable onPress={() => setOpen((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: open ? 1 : 0, borderBottomColor: T.line }}>
        <Plate color={T[p.color]} size={26} />
        <Text style={{ flex: 1, fontSize: 15, fontWeight: '900', color: T.ink }}>{DOW[g]}|{p.name}</Text>
        <Text style={{ fontSize: 11.5, color: T.muted, fontVariant: ['tabular-nums'] }}>{p.time}</Text>
      </Pressable>
      {open && (
        <View>
          {p.list.map((id, i) => {
            const ex = EX[id];
            return (
              <View key={id} style={{ flexDirection: 'row', gap: 10, padding: 10, paddingHorizontal: 13, borderTopWidth: i ? 1 : 0, borderTopColor: T.line }}>
                <Text style={{ fontWeight: '800', color: dayTextColor(T, p.color), fontVariant: ['tabular-nums'] }}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: T.ink }}>{ex.n}</Text>
                  <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 1 }}>{ex.hint} · 替代:{ex.alts.join('、')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 12.5, fontWeight: '800', color: T.ink, fontVariant: ['tabular-nums'] }}>
                    {ex.sets}×{ex.lo === ex.hi ? ex.lo : `${ex.lo}–${ex.hi}`}
                  </Text>
                  <Text style={{ fontSize: 10.5, color: T.muted }}>休 {restLabel(ex.rest)}</Text>
                </View>
              </View>
            );
          })}
          <Text style={{ fontSize: 12.5, color: T.muted, padding: 12, borderTopWidth: 1, borderTopColor: T.line, lineHeight: 19 }}>{p.note}</Text>
        </View>
      )}
    </Card>
  );
}

const PRINCIPLES = (bw) => [
  ['漸進超負荷', '同重量做到次數上限全數達標 → 下週加重(app 會自動幫你算)。做不滿下限就維持原重量。'],
  ['保留 1–2 下餘力(RIR 1–2)', '每組結束應該還能再做 1–2 下,不必每組力竭。力竭留給最後一組或孤立動作。'],
  ['蛋白質與熱量', `以 ${bw} kg 計:蛋白質每天 ${Math.round(bw * 1.6)}–${Math.round(bw * 1.9)} g,增肌熱量小幅盈餘 +300 kcal,體重每月 +0.5–1 kg 為佳。`],
  ['休息時間用計時器', '每組記錄完成後 app 會自動倒數,休息一到就做下一組。'],
];

export default function PlanScreen() {
  const { S, update, T } = useApp();
  const [busy, setBusy] = useState(false);

  const toggleRemind = async (on) => {
    setBusy(true);
    try {
      if (on) {
        const ok = await enableWeeklyReminders(S.set.remindHour);
        update((s) => { s.set.remindOn = ok; });
      } else {
        await disableReminders();
        update((s) => { s.set.remindOn = false; });
      }
    } finally { setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 120 }}>
      <SectionTitle sub="槓片顏色 = 訓練日。點開每一天可看動作與替代選項。週三、週末休息。">每週課表</SectionTitle>
      {[1, 2, 4, 5].map((g) => <DayCard key={g} g={g} />)}

      <SectionTitle sub="訓練日當天推播提醒(週一/二/四/五)。你的 Google 日曆也已建立 19:00 的每週行程。">📅 訓練提醒</SectionTitle>
      <Card style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14.5, fontWeight: '700', color: T.ink }}>每週訓練日推播</Text>
          <Text style={{ fontSize: 12.5, color: T.muted }}>提醒時間 {S.set.remindHour}:00(可在設定調整)</Text>
        </View>
        <Switch value={!!S.set.remindOn} onValueChange={toggleRemind} disabled={busy} trackColor={{ true: T.green }} />
      </Card>

      <SectionTitle>執行原則</SectionTitle>
      <Card style={{ padding: 14, gap: 12 }}>
        {PRINCIPLES(S.set.bw).map(([t, b]) => (
          <View key={t}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: T.ink }}>{t}</Text>
            <Text style={{ fontSize: 13, color: T.muted, lineHeight: 19, marginTop: 2 }}>{b}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
