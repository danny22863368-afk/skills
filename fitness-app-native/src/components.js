import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useApp } from './store';

/* IPF 槓片圖示 */
export function Plate({ color, size = 30 }) {
  const { T } = useApp();
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      borderWidth: size / 6, borderColor: color || T.muted,
      alignItems: 'center', justifyContent: 'center', backgroundColor: T.paper,
    }}>
      <View style={{
        width: size / 3, height: size / 3, borderRadius: size / 6,
        borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.18)', backgroundColor: T.paper,
      }} />
    </View>
  );
}

export function Card({ children, style }) {
  const { T } = useApp();
  return <View style={[{ borderWidth: 1, borderColor: T.line, backgroundColor: T.card }, style]}>{children}</View>;
}

export function SectionTitle({ children, sub }) {
  const { T } = useApp();
  return (
    <View style={{ marginTop: 22, marginBottom: 10 }}>
      <Text style={{ fontSize: 17, fontWeight: '900', color: T.ink }}>{children}</Text>
      {sub ? <Text style={{ fontSize: 13, color: T.muted, marginTop: 3, lineHeight: 19 }}>{sub}</Text> : null}
    </View>
  );
}

export function Btn({ label, onPress, ghost, small, disabled, style }) {
  const { T } = useApp();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [{
        borderWidth: 2, borderColor: T.ink,
        backgroundColor: ghost ? 'transparent' : T.ink,
        paddingVertical: small ? 6 : 10, paddingHorizontal: small ? 12 : 16,
        opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        alignItems: 'center',
      }, style]}
    >
      <Text style={{ color: ghost ? T.ink : T.paper, fontWeight: '700', fontSize: small ? 13 : 14.5 }}>{label}</Text>
    </Pressable>
  );
}

export function Linky({ label, onPress }) {
  const { T } = useApp();
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={{ color: T.muted, fontSize: 12.5, textDecorationLine: 'underline' }}>{label}</Text>
    </Pressable>
  );
}

/* 數值步進器(重量/次數) */
export function Stepper({ value, unit, onMinus, onPlus }) {
  const { T } = useApp();
  const bs = { width: 38, alignItems: 'center', justifyContent: 'center', backgroundColor: T.soft };
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1.5, borderColor: T.line, flex: 1, minHeight: 46 }}>
      <Pressable style={bs} onPress={onMinus} hitSlop={6}><Text style={{ fontSize: 20, fontWeight: '800', color: T.ink }}>−</Text></Pressable>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontWeight: '800', fontSize: 15, color: T.ink, fontVariant: ['tabular-nums'] }}>{value}</Text>
        <Text style={{ fontSize: 10.5, color: T.muted }}>{unit}</Text>
      </View>
      <Pressable style={bs} onPress={onPlus} hitSlop={6}><Text style={{ fontSize: 20, fontWeight: '800', color: T.ink }}>+</Text></Pressable>
    </View>
  );
}

/* 營養進度計量 */
export function Meter({ name, val, target, unit, band }) {
  const { T } = useApp();
  const pct = Math.min(100, (val / target) * 100);
  const over = val > target * 1.25;
  const ok = band ? val >= target : val >= target * 0.9 && !over;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'baseline' }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: T.ink }}>{name}</Text>
        <Text style={{ fontSize: 13, color: T.ink, fontVariant: ['tabular-nums'] }}>
          <Text style={{ fontWeight: '800' }}>{Math.round(val)}</Text>
          <Text style={{ color: T.muted }}> / {target} {unit}</Text>
        </Text>
      </View>
      <View style={{ height: 10, backgroundColor: T.soft, borderWidth: 1, borderColor: T.line }}>
        <View style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`,
          backgroundColor: over ? T.warn : ok ? T.good : T.ink,
        }} />
      </View>
    </View>
  );
}
