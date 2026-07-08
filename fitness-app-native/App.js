import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, useColorScheme, Vibration, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { PROGRAM, DOW } from './src/data';
import { THEMES } from './src/theme';
import { loadState, persist, AppCtx } from './src/store';
import { Plate, Btn } from './src/components';
import { enableWeeklyReminders } from './src/notifications';
import TodayScreen from './src/screens/TodayScreen';
import PlanScreen from './src/screens/PlanScreen';
import FoodScreen from './src/screens/FoodScreen';
import StatsScreen from './src/screens/StatsScreen';

const TABS = [
  { key: 'today', label: '今日', icon: '🏋️', C: TodayScreen },
  { key: 'plan', label: '課表', icon: '📋', C: PlanScreen },
  { key: 'food', label: '飲食', icon: '🍱', C: FoodScreen },
  { key: 'stats', label: '數據', icon: '📈', C: StatsScreen },
];

export default function App() {
  const scheme = useColorScheme();
  const T = THEMES[scheme === 'dark' ? 'dark' : 'light'];
  const [S, setS] = useState(null);
  const [tab, setTab] = useState('today');
  const [showSettings, setShowSettings] = useState(false);

  /* 休息計時器(全域) */
  const [timer, setTimer] = useState(null); // {left, total, label}
  const timerRef = useRef(null);
  const startTimer = useCallback((sec, label) => {
    clearInterval(timerRef.current);
    setTimer({ left: sec, total: sec, label });
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (!t) return null;
        if (t.left <= 1) {
          clearInterval(timerRef.current);
          Vibration.vibrate([0, 200, 100, 200, 100, 400]);
          setTimeout(() => setTimer((x) => (x && x.left === 0 ? null : x)), 4000);
          return { ...t, left: 0, label: '休息結束,下一組!' };
        }
        return { ...t, left: t.left - 1 };
      });
    }, 1000);
  }, []);
  const stopTimer = () => { clearInterval(timerRef.current); setTimer(null); };

  useEffect(() => {
    loadState().then(setS);
    return () => clearInterval(timerRef.current);
  }, []);

  const update = useCallback((fn) => {
    setS((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      fn(next);
      persist(next);
      return next;
    });
  }, []);

  if (!S) return <View style={{ flex: 1, backgroundColor: T.paper }} />;

  const p = PROGRAM[new Date().getDay()];
  const d = new Date();
  const ActiveScreen = TABS.find((t) => t.key === tab).C;

  return (
    <AppCtx.Provider value={{ S, update, T, startTimer }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: T.paper }}>
        <StatusBar style={T.barStyle} />
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingTop: Platform.OS === 'android' ? 42 : 8, paddingBottom: 10, borderBottomWidth: 3, borderBottomColor: T.ink }}>
          <Plate color={p ? T[p.color] : T.muted} size={30} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: T.muted }}>
              {d.getMonth() + 1}月{d.getDate()}日 · {DOW[d.getDay()]}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: T.ink }}>{p ? p.name : '休息日'}</Text>
          </View>
          <Pressable onPress={() => setShowSettings(true)} hitSlop={8}
            style={{ width: 38, height: 38, borderWidth: 1.5, borderColor: T.line, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 17 }}>⚙️</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1 }}><ActiveScreen /></View>

        {/* 休息計時器 */}
        {timer && (
          <View style={{ backgroundColor: T.ink, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ fontSize: 26, fontWeight: '900', color: T.paper, minWidth: 84, fontVariant: ['tabular-nums'] }}>
              {Math.floor(timer.left / 60)}:{String(timer.left % 60).padStart(2, '0')}
            </Text>
            <Text style={{ flex: 1, fontSize: 12.5, color: T.paper, opacity: 0.8 }}>{timer.label}</Text>
            <Pressable onPress={() => setTimer((t) => t && { ...t, left: t.left + 30, total: t.total + 30 })} hitSlop={6}
              style={{ borderWidth: 1.5, borderColor: T.paper, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: T.paper, fontSize: 13, fontWeight: '700' }}>+30s</Text>
            </Pressable>
            <Pressable onPress={stopTimer} hitSlop={6} style={{ borderWidth: 1.5, borderColor: T.paper, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: T.paper, fontSize: 13, fontWeight: '700' }}>結束</Text>
            </Pressable>
          </View>
        )}

        {/* Tab bar */}
        <View style={{ flexDirection: 'row', borderTopWidth: 2, borderTopColor: T.ink, backgroundColor: T.card, paddingBottom: Platform.OS === 'ios' ? 14 : 6 }}>
          {TABS.map((t) => (
            <Pressable key={t.key} onPress={() => setTab(t.key)} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 19, opacity: tab === t.key ? 1 : 0.45 }}>{t.icon}</Text>
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: tab === t.key ? T.ink : T.muted }}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} S={S} update={update} T={T} />
      </SafeAreaView>
    </AppCtx.Provider>
  );
}

function SettingsModal({ visible, onClose, S, update, T }) {
  const [key, setKey] = useState(S.set.key);
  const [bw, setBw] = useState(String(S.set.bw));
  const [pTar, setPTar] = useState(String(S.set.p));
  const [kTar, setKTar] = useState(String(S.set.kcal));
  const [hr, setHr] = useState(String(S.set.remindHour));

  useEffect(() => {
    if (visible) {
      setKey(S.set.key); setBw(String(S.set.bw)); setPTar(String(S.set.p));
      setKTar(String(S.set.kcal)); setHr(String(S.set.remindHour));
    }
  }, [visible]);

  const saveAll = async () => {
    const newHour = Math.min(23, Math.max(0, parseInt(hr, 10) || 18));
    update((s) => {
      s.set.key = key.trim();
      s.set.bw = parseFloat(bw) || 68;
      s.set.p = parseInt(pTar, 10) || 120;
      s.set.kcal = parseInt(kTar, 10) || 2600;
      s.set.remindHour = newHour;
    });
    if (S.set.remindOn && newHour !== S.set.remindHour) await enableWeeklyReminders(newHour);
    onClose();
  };

  const inputStyle = { borderWidth: 1.5, borderColor: T.line, padding: 10, color: T.ink, fontSize: 15, backgroundColor: T.card };
  const labelStyle = { fontSize: 12.5, fontWeight: '700', color: T.muted, marginBottom: 4 };
  const noteStyle = { fontSize: 11.5, color: T.muted, marginTop: 4 };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={{ backgroundColor: T.paper, borderTopWidth: 3, borderTopColor: T.ink, maxHeight: '85%' }}>
          <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 36 }} keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 17, fontWeight: '900', color: T.ink, marginBottom: 14 }}>設定</Text>

            <View style={{ marginBottom: 14 }}>
              <Text style={labelStyle}>Anthropic API Key(拍照 AI 分析用)</Text>
              <TextInput value={key} onChangeText={setKey} placeholder="sk-ant-…" placeholderTextColor={T.muted} secureTextEntry autoCapitalize="none" autoCorrect={false} style={inputStyle} />
              <Text style={noteStyle}>於 platform.claude.com 建立。金鑰只存在這台裝置,不會上傳到任何其他地方。</Text>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={labelStyle}>體重(kg)</Text>
              <TextInput value={bw} onChangeText={setBw} keyboardType="numeric" style={inputStyle} />
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={labelStyle}>每日蛋白質目標(g)</Text>
              <TextInput value={pTar} onChangeText={setPTar} keyboardType="numeric" style={inputStyle} />
              <Text style={noteStyle}>增肌建議 1.6–1.9 g/kg;以你目前體重約 {Math.round((parseFloat(bw) || 68) * 1.6)}–{Math.round((parseFloat(bw) || 68) * 1.9)} g</Text>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={labelStyle}>每日熱量目標(kcal)</Text>
              <TextInput value={kTar} onChangeText={setKTar} keyboardType="numeric" style={inputStyle} />
              <Text style={noteStyle}>增肌:維持熱量 +300 kcal 小幅盈餘</Text>
            </View>
            <View style={{ marginBottom: 14 }}>
              <Text style={labelStyle}>訓練日提醒時間(0–23 點)</Text>
              <TextInput value={hr} onChangeText={setHr} keyboardType="numeric" style={inputStyle} />
              <Text style={noteStyle}>在課表分頁開啟/關閉推播提醒</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Btn label="儲存" onPress={saveAll} style={{ flex: 1 }} />
              <Btn label="關閉" ghost onPress={onClose} />
            </View>
            <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 14 }}>所有訓練與飲食資料皆儲存在此裝置。</Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
