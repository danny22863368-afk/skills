import React from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { EX, MUSCLES } from '../data';
import { weekVolume } from '../logic';
import { useApp } from '../store';
import { Card, SectionTitle } from '../components';

function LiftChart({ exId, color }) {
  const { S, T } = useApp();
  const { width } = useWindowDimensions();
  const ex = EX[exId];
  const hist = Object.keys(S.logs).sort()
    .filter((d) => S.logs[d][exId] && S.logs[d][exId].length)
    .map((d) => ({ d, w: Math.max(...S.logs[d][exId].map((s) => s.w)) }))
    .slice(-10);

  const W = Math.min(width, 560) - 28 - 2; // 版面寬 − padding − 邊框
  const H = 150, padL = 12, padR = 52, padT = 18, padB = 24;

  let body;
  if (hist.length < 2) {
    body = (
      <Text style={{ padding: 18, color: T.muted, fontSize: 13, textAlign: 'center' }}>
        {hist.length ? '再記錄一次就會出現趨勢線' : `還沒有紀錄 —— 完成第一次${ex.n}後就會出現在這裡`}
      </Text>
    );
  } else {
    const ws = hist.map((h) => h.w);
    const lo = Math.min(...ws), hi = Math.max(...ws);
    const span = hi - lo || 1;
    const x = (i) => padL + (i * (W - padL - padR)) / (hist.length - 1);
    const y = (w) => padT + (H - padT - padB) * (1 - (w - lo) / span);
    const pts = hist.map((h, i) => `${x(i)},${y(h.w).toFixed(1)}`).join(' ');
    const last = hist[hist.length - 1];
    body = (
      <Svg width={W} height={H}>
        <Line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke={T.line} strokeWidth={1} />
        <Polyline points={pts} fill="none" stroke={T[color]} strokeWidth={2} strokeLinejoin="round" />
        {hist.map((h, i) => (
          <Circle key={i} cx={x(i)} cy={+y(h.w).toFixed(1)} r={i === hist.length - 1 ? 5 : 3.5} fill={T[color]} stroke={T.card} strokeWidth={2} />
        ))}
        <SvgText x={x(hist.length - 1) + 9} y={+y(last.w).toFixed(1) + 4} fontSize={13} fontWeight="800" fill={T.ink}>{last.w}kg</SvgText>
        <SvgText x={padL} y={H - 7} fontSize={10.5} fill={T.muted}>{hist[0].d.slice(5)}</SvgText>
        <SvgText x={W - padR} y={H - 7} fontSize={10.5} fill={T.muted} textAnchor="end">{last.d.slice(5)}</SvgText>
      </Svg>
    );
  }
  return (
    <Card style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, paddingBottom: hist.length < 2 ? 0 : 6 }}>
        <View style={{ width: 10, height: 10, backgroundColor: T[color] }} />
        <Text style={{ fontSize: 14.5, fontWeight: '900', color: T.ink }}>{ex.n}</Text>
        {hist.length >= 2 && <Text style={{ fontSize: 12, color: T.muted }}>最近 {hist.length} 次</Text>}
      </View>
      {body}
    </Card>
  );
}

export default function StatsScreen() {
  const { S, T } = useApp();
  const vol = weekVolume(S);
  const maxV = Math.max(20, ...Object.values(vol));

  return (
    <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 120 }}>
      <SectionTitle sub="週一起算。虛線區間 = 胸、背每週建議 13–15 組;一般肌群每週 10–20 組皆屬有效範圍。">本週訓練量(組數/肌群)</SectionTitle>
      <Card style={{ padding: 14 }}>
        {MUSCLES.map((mu) => {
          const v = vol[mu.k] || 0;
          const w = Math.min(100, (v / maxV) * 100);
          const inBand = mu.band ? v >= mu.band[0] && v <= mu.band[1] : null;
          return (
            <View key={mu.k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 9 }}>
              <Text style={{ width: 46, fontSize: 13, fontWeight: '700', color: T.ink }}>{mu.k}</Text>
              <View style={{ flex: 1, height: 12, backgroundColor: T.soft, borderWidth: 1, borderColor: T.line }}>
                {mu.band && (
                  <View style={{
                    position: 'absolute', top: -3, bottom: -3,
                    left: `${(mu.band[0] / maxV) * 100}%`, width: `${((mu.band[1] - mu.band[0]) / maxV) * 100}%`,
                    backgroundColor: T.goodBg, borderLeftWidth: 1.5, borderRightWidth: 1.5,
                    borderColor: T.good, borderStyle: 'dashed',
                  }} />
                )}
                <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${w}%`, backgroundColor: inBand === true ? T.good : T.ink }} />
              </View>
              <Text style={{ width: 86, fontSize: 12, color: T.muted, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
                {v} 組{inBand === true ? ' ✓' : mu.band && v > 0 ? ` / ${mu.band[0]}–${mu.band[1]}` : ''}
              </Text>
            </View>
          );
        })}
      </Card>

      <SectionTitle sub="每次訓練的最重一組。持續記錄就會看到往右上走的線。">主項重量進展</SectionTitle>
      <LiftChart exId="bench" color="red" />
      <LiftChart exId="squat" color="blue" />
      <LiftChart exId="dead" color="green" />
    </ScrollView>
  );
}
