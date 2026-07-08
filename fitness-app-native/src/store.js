import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext } from 'react';

const LS_KEY = 'danny-fit-v1';

export const DEFAULT_STATE = {
  logs: {},   // {'YYYY-MM-DD': {exId: [{w, r}]}}
  food: {},   // {'YYYY-MM-DD': [{n, qLabel, kcal, p, c, f}]}
  set: { key: '', kcal: 2600, p: 120, c: 320, f: 75, bw: 68, remindHour: 18, remindOn: false },
};

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(LS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.logs) return { ...DEFAULT_STATE, ...s, set: { ...DEFAULT_STATE.set, ...s.set } };
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

export function persist(S) {
  AsyncStorage.setItem(LS_KEY, JSON.stringify(S)).catch(() => {});
}

/* App 透過 context 提供 {S, update, T(theme), startTimer} */
export const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);
