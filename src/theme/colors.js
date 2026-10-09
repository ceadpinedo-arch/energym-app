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

export const estilos = {
  menta: { label: 'Menta' },
  oscuro: { label: 'Noche' },
  minimal: { label: 'Minimal' },
  colorido: { label: 'Colorido' },
};

export function getTheme(isDark, accentKey = 'menta', estiloKey = 'menta') {
  const base = isDark ? dark : light;
  const accent = accents[accentKey] || accents.menta;
  const primary = isDark ? accent.dark : accent.light;
  const t = { ...base, primary };
  if (estiloKey === 'oscuro') {
    return { ...t, gradient: ['#0B1210', accent.dark + '33'] };
  }
  if (estiloKey === 'minimal') {
    return isDark
      ? { ...t, bg: '#0E0E0E', surface: '#181818', border: '#2A2A2A', gradient: ['#0E0E0E', '#0E0E0E'], primaryBg: '#242424' }
      : { ...t, bg: '#F6F6F6', surface: '#FFFFFF', border: '#E4E4E4', gradient: ['#F6F6F6', '#F6F6F6'], primaryBg: '#EDEDED' };
  }
  if (estiloKey === 'colorido') {
    return isDark
      ? { ...t, gradient: [accent.dark + '55', '#FF9E8255'] }
      : { ...t, gradient: [accent.light + '55', '#F08A6C55'] };
  }
  return t;
}