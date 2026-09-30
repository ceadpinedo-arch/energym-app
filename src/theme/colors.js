export const light = {
  bg: '#E3F3EE',
  surface: '#FFFFFF',
  border: '#D3E8E1',
  textPrimary: '#1F2D2B',
  textSecondary: '#6F8580',
  primary: '#2F8F83',
  onPrimary: '#FFFFFF',
  primaryBg: '#D8F0EA',
  coral: '#F08A6C',
  coralBg: '#FDE7DF',
  gradient: ['#D9F2EA', '#FBEADF'],
  success: '#2E7D4F',
  successBg: '#E1F3E8',
  warning: '#9A5B0B',
  warningBg: '#FAEEDA',
  danger: '#A32D2D',
  dangerBg: '#FCEBEB',
};

export const dark = {
  bg: '#14201E',
  surface: '#1D2D2A',
  border: '#2E4541',
  textPrimary: '#EAF5F2',
  textSecondary: '#9DB5B0',
  primary: '#5FD1BF',
  onPrimary: '#0F1F1C',
  primaryBg: '#25403B',
  coral: '#FF9E82',
  coralBg: '#4A2A20',
  gradient: ['#14201E', '#1F2A28'],
  success: '#97C459',
  successBg: '#173404',
  warning: '#FAC775',
  warningBg: '#412402',
  danger: '#F09595',
  dangerBg: '#501313',
};

export const accents = {
  menta:   { light: '#2F8F83', dark: '#5FD1BF' },
  violeta: { light: '#534AB7', dark: '#AFA9EC' },
  verde:   { light: '#1F7A4D', dark: '#5FD79B' },
  naranja: { light: '#B4560A', dark: '#FFB067' },
  rosa:    { light: '#B03060', dark: '#FF9EC0' },
  celeste: { light: '#0B6FA8', dark: '#7FD1FF' },
};

export function getTheme(isDark, accentKey = 'menta') {
  const base = isDark ? dark : light;
  const accent = accents[accentKey] || accents.menta;
  return { ...base, primary: isDark ? accent.dark : accent.light };
}
