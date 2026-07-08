/* 兩套配色皆通過色彩可用性驗證(亮度帶、CVD 分離、對比) */
export const THEMES = {
  light: {
    paper: '#FAFAF7', card: '#FFFFFF', ink: '#16181D', muted: '#6B6E76',
    line: '#D9D9D2', soft: '#F0F0EA', soft2: '#F7F7F2',
    red: '#C8102E', blue: '#0057B8', yellow: '#E0A800', green: '#00843D',
    yellowText: '#8A6A00',
    good: '#00843D', warn: '#B87400', bad: '#C8102E',
    goodBg: '#E9F2EC', warnBg: '#F6EFE0', badBg: '#F7E7E9',
    barStyle: 'dark',
  },
  dark: {
    paper: '#131318', card: '#1C1C23', ink: '#EDEDE8', muted: '#9A9DA6',
    line: '#33343C', soft: '#22232A', soft2: '#1A1A20',
    red: '#F0546A', blue: '#4E8FE0', yellow: '#B8860B', green: '#2FA45F',
    yellowText: '#D9A420',
    good: '#2FA45F', warn: '#D9A420', bad: '#F0546A',
    goodBg: '#1B2A21', warnBg: '#2A2418', badBg: '#2C1C20',
    barStyle: 'light',
  },
};

export function dayColor(T, colorName) {
  return T[colorName];
}
/* 黃色在淺色底當文字太淺,改用可讀的深黃 */
export function dayTextColor(T, colorName) {
  return colorName === 'yellow' ? T.yellowText : T[colorName];
}
