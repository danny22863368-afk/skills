import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Image, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FOOD_DB } from '../data';
import { macroSum, todayFood, todayKey } from '../logic';
import { useApp } from '../store';
import { Card, Btn, Meter, SectionTitle } from '../components';
import { analyzeMealPhoto } from '../ai';

export default function FoodScreen() {
  const { S, update, T } = useApp();
  const m = macroSum(S);
  const list = todayFood(S);
  const pLeft = Math.max(0, S.set.p - m.p);

  const [query, setQuery] = useState('');
  const [picking, setPicking] = useState(null); // 食物 DB 選中的項目
  const [qty, setQty] = useState('');
  const [imgUri, setImgUri] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiChecked, setAiChecked] = useState([]);
  const [aiErr, setAiErr] = useState('');

  const addFood = (item) => update((s) => {
    const t = todayKey();
    if (!s.food[t]) s.food[t] = [];
    s.food[t].push(item);
  });
  const removeFood = (i) => update((s) => { s.food[todayKey()].splice(i, 1); });

  const pickImage = async (fromCamera) => {
    const fn = fromCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    if (fromCamera) {
      const p = await ImagePicker.requestCameraPermissionsAsync();
      if (!p.granted) { Alert.alert('需要相機權限', '請到系統設定開啟相機權限。'); return; }
    }
    const r = await fn({ mediaTypes: ['images'], quality: 0.9 });
    if (!r.canceled && r.assets && r.assets[0]) {
      setImgUri(r.assets[0].uri);
      setAiResult(null); setAiErr('');
    }
  };

  const runAi = async () => {
    if (!S.set.key) { setAiErr('尚未設定 API key。到「設定」貼上你的 Anthropic API key(platform.claude.com 取得),金鑰只儲存在這台裝置。'); return; }
    setAiBusy(true); setAiErr(''); setAiResult(null);
    try {
      const r = await analyzeMealPhoto(S.set.key, imgUri);
      if (!r.foods || !r.foods.length) { setAiErr('照片中沒有辨識出食物,換個角度再拍一張?'); return; }
      setAiResult(r);
      setAiChecked(r.foods.map(() => true));
    } catch (e) {
      setAiErr(String(e.message || e));
    } finally { setAiBusy(false); }
  };

  const addAiFoods = () => {
    aiResult.foods.forEach((f, i) => {
      if (aiChecked[i]) addFood({ n: f.name, qLabel: f.portion, kcal: f.kcal, p: f.protein, c: f.carbs, f: f.fat });
    });
    setAiResult(null); setImgUri(null);
  };

  const hits = FOOD_DB.filter((f) => !query || f.n.includes(query)).slice(0, query ? 12 : 8);

  return (
    <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
      <SectionTitle sub={pLeft > 0 ? `蛋白質還差 ${Math.round(pLeft)} g,約等於 ${Math.ceil((pLeft / 31) * 100)} g 雞胸肉或 ${Math.ceil(pLeft / 24)} 匙乳清` : '✓ 蛋白質已達標,今天吃得很好!'}>今日營養</SectionTitle>
      <Card style={{ padding: 14 }}>
        <Meter name="蛋白質" val={m.p} target={S.set.p} unit="g" band />
        <Meter name="熱量" val={m.kcal} target={S.set.kcal} unit="kcal" />
        <Meter name="碳水" val={m.c} target={S.set.c} unit="g" />
        <Meter name="脂肪" val={m.f} target={S.set.f} unit="g" />
      </Card>

      <SectionTitle sub="拍下餐點,AI 視覺辨識食物並估算蛋白質等營養素。">📷 拍照 AI 分析</SectionTitle>
      <Card style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Btn label="📷 拍照" onPress={() => pickImage(true)} />
          <Btn label="🖼 選照片" ghost onPress={() => pickImage(false)} />
          <Btn label={aiBusy ? '分析中…' : '分析這張照片'} ghost disabled={!imgUri || aiBusy} onPress={runAi} />
        </View>
        {imgUri && <Image source={{ uri: imgUri }} style={{ width: '100%', height: 200, marginTop: 12, borderWidth: 1, borderColor: T.line }} resizeMode="cover" />}
        {aiBusy && (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 12 }}>
            <ActivityIndicator color={T.ink} />
            <Text style={{ color: T.muted, fontSize: 13 }}>AI 分析中,約需 10–20 秒…</Text>
          </View>
        )}
        {!!aiErr && (
          <View style={{ marginTop: 12, padding: 12, borderLeftWidth: 4, borderLeftColor: T.bad, backgroundColor: T.badBg }}>
            <Text style={{ fontSize: 13, color: T.ink, lineHeight: 19 }}>{aiErr}</Text>
          </View>
        )}
        {aiResult && (
          <View style={{ marginTop: 12, borderWidth: 1, borderColor: T.line }}>
            {aiResult.foods.map((f, i) => (
              <Pressable key={i} onPress={() => setAiChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
                style={{ flexDirection: 'row', gap: 10, padding: 10, borderTopWidth: i ? 1 : 0, borderTopColor: T.line, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, color: aiChecked[i] ? T.good : T.muted }}>{aiChecked[i] ? '☑' : '☐'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: T.ink }}>{f.name} <Text style={{ color: T.muted, fontWeight: '400', fontSize: 12 }}>{f.portion}</Text></Text>
                  <Text style={{ fontSize: 12, color: T.muted, fontVariant: ['tabular-nums'] }}>
                    {Math.round(f.kcal)} kcal · 蛋白 {Math.round(f.protein)}g · 碳水 {Math.round(f.carbs)}g · 脂肪 {Math.round(f.fat)}g
                  </Text>
                </View>
              </Pressable>
            ))}
            <View style={{ padding: 10, borderTopWidth: 1, borderTopColor: T.line, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ flex: 1, fontSize: 12, color: T.muted }}>{aiResult.note || ''}</Text>
              <Btn small label="加入勾選項目" onPress={addAiFoods} />
            </View>
          </View>
        )}
      </Card>

      <SectionTitle>快速新增</SectionTitle>
      <Card>
        <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: T.line }}>
          <TextInput
            value={query} onChangeText={setQuery}
            placeholder="搜尋食物,例如:雞胸、便當、乳清…" placeholderTextColor={T.muted}
            style={{ borderWidth: 1.5, borderColor: T.line, padding: 9, color: T.ink, fontSize: 14, backgroundColor: T.card }}
          />
        </View>
        {hits.map((f, i) => (
          <Pressable key={f.n} onPress={() => { setPicking(f); setQty(String(f.q)); }}
            style={{ flexDirection: 'row', padding: 10, paddingHorizontal: 13, borderTopWidth: i ? 1 : 0, borderTopColor: T.line, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 14, color: T.ink, flex: 1 }}>{f.n}</Text>
            <Text style={{ fontSize: 11.5, color: T.muted, fontVariant: ['tabular-nums'] }}>
              {f.u === 'g' ? '每100g' : `每${f.note || '份'}`} · {f.kcal} kcal · P{f.p}g
            </Text>
          </Pressable>
        ))}
      </Card>

      <SectionTitle>{`今日已記錄 ${list.length} 筆`}</SectionTitle>
      <Card>
        {list.length === 0 && <Text style={{ padding: 16, color: T.muted, fontSize: 13, textAlign: 'center' }}>今天還沒有紀錄,拍張照或搜尋食物開始吧</Text>}
        {list.map((f, i) => (
          <View key={i} style={{ flexDirection: 'row', padding: 10, paddingHorizontal: 13, borderTopWidth: i ? 1 : 0, borderTopColor: T.line, alignItems: 'center', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: T.ink }}>{f.n}</Text>
              <Text style={{ fontSize: 11.5, color: T.muted, fontVariant: ['tabular-nums'] }}>
                {f.qLabel || ''} · {Math.round(f.kcal)} kcal · C{Math.round(f.c)} F{Math.round(f.f)}
              </Text>
            </View>
            <Text style={{ fontWeight: '800', color: T.good, fontVariant: ['tabular-nums'] }}>P {Math.round(f.p)}g</Text>
            <Pressable onPress={() => removeFood(i)} hitSlop={8}><Text style={{ color: T.muted, fontSize: 15 }}>✕</Text></Pressable>
          </View>
        ))}
      </Card>

      {/* 份量輸入 */}
      <Modal visible={!!picking} transparent animationType="fade" onRequestClose={() => setPicking(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setPicking(null)} />
          {picking && (
            <View style={{ backgroundColor: T.paper, borderTopWidth: 3, borderTopColor: T.ink, padding: 18, paddingBottom: 34 }}>
              <Text style={{ fontSize: 17, fontWeight: '900', color: T.ink, marginBottom: 10 }}>{picking.n}</Text>
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: T.muted, marginBottom: 4 }}>
                {picking.u === 'g' ? '份量(公克)' : `份數${picking.note ? `(${picking.note})` : ''}`}
              </Text>
              <TextInput value={qty} onChangeText={setQty} keyboardType="numeric" autoFocus
                style={{ borderWidth: 1.5, borderColor: T.line, padding: 10, color: T.ink, fontSize: 16, backgroundColor: T.card }} />
              <Text style={{ fontSize: 11.5, color: T.muted, marginTop: 6, fontVariant: ['tabular-nums'] }}>
                每{picking.u === 'g' ? '100g' : picking.note || '份'}:{picking.kcal} kcal · 蛋白 {picking.p}g · 碳水 {picking.c}g · 脂肪 {picking.f}g
              </Text>
              <Btn label="加入今日紀錄" style={{ marginTop: 14 }} onPress={() => {
                const q = Math.max(0, parseFloat(qty) || 0);
                const k = picking.u === 'g' ? q / 100 : q;
                addFood({ n: picking.n, qLabel: picking.u === 'g' ? `${q} g` : `${q} 份`, kcal: picking.kcal * k, p: picking.p * k, c: picking.c * k, f: picking.f * k });
                setPicking(null);
              }} />
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
