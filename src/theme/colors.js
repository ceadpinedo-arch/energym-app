export const light = {
  bg: '#E3F3EE', surface: '#FFFFFF', innerBg: '#F1F8F5', border: '#D3E8E1', cardBorder: '#D3E8E1',
  textPrimary: '#1F2D2B', textSecondary: '#6F8580', primary: '#6D28D9', primaryGlow: '#A855F7',
  onPrimary: '#FFFFFF', primaryBg: '#EDE9FE', cyan: '#0891B2', cyanBg: 'rgba(6, 182, 212, 0.12)',
  cyanBorder: '#06B6D4', coral: '#F08A6C', coralBg: '#FDE7DF', gradient: ['#D9F2EA', '#FBEADF'],
  buttonGradient: ['#7C3AED', '#4F46E5'], capsuleGradient: ['#38BDF8', '#2563EB'],
  success: '#10B981', successBg: '#E1F3E8', successBorder: '#34D399',
  warning: '#F59E0B', warningBg: '#FAEEDA', danger: '#EF4444', dangerBg: '#FCEBEB',
};

export const dark = {
  bg: '#070A14', surface: 'rgba(18, 25, 46, 0.78)', innerBg: 'rgba(9, 13, 26, 0.88)',
  border: 'rgba(148, 163, 184, 0.22)', cardBorder: 'rgba(139, 92, 246, 0.28)',
  textPrimary: '#F8FAFC', textSecondary: '#94A3B8', primary: '#8B5CF6', primaryGlow: '#C084FC',
  onPrimary: '#FFFFFF', primaryBg: 'rgba(139, 92, 246, 0.18)', cyan: '#22D3EE',
  cyanBg: 'rgba(6, 182, 212, 0.18)', cyanBorder: '#22D3EE', coral: '#FB923C',
  coralBg: 'rgba(251, 146, 60, 0.18)', gradient: ['#060814', '#0B1228', '#071927'],
  buttonGradient: ['#7C3AED', '#4F46E5'], capsuleGradient: ['#38BDF8', '#2563EB'],
  success: '#34D399', successBg: 'rgba(16, 185, 129, 0.14)', successBorder: 'rgba(52, 211, 153, 0.48)',
  warning: '#FBBF24', warningBg: 'rgba(245, 158, 11, 0.16)', danger: '#F87171', dangerBg: 'rgba(239, 68, 68, 0.18)',
};

export const accents = {
  violeta: { light: '#6D28D9', dark: '#8B5CF6' },
  celeste: { light: '#0284C7', dark: '#22D3EE' },
  menta:   { light: '#2F8F83', dark: '#2DD4BF' },
  verde:   { light: '#10B981', dark: '#34D399' },
  naranja: { light: '#EA580C', dark: '#FB923C' },
  rosa:    { light: '#DB2777', dark: '#F472B6' },
};

export const estilos = {
  oscuro: { label: 'Sci-Fi Neón' },
  menta: { label: 'Menta' },
  minimal: { label: 'Minimal' },
  colorido: { label: 'Colorido' },
};

export function getTheme(isDark = true, accentKey = 'violeta', estiloKey = 'oscuro') {
  const base = isDark ? dark : light;
  const accent = accents[accentKey] || accents.violeta;
  const primary = isDark ? accent.dark : accent.light;
  const t = { ...base, primary };
  if (estiloKey === 'oscuro') {
    return { ...dark, primary: accents[accentKey] ? accents[accentKey].dark : dark.primary, gradient: ['#060814', '#0B1228', '#071927'] };
  }
  if (estiloKey === 'minimal') {
    return isDark
      ? { ...t, bg: '#09090B', surface: '#18181B', border: '#27272A', gradient: ['#09090B', '#09090B'] }
      : { ...t, bg: '#F4F4F5', surface: '#FFFFFF', border: '#E4E4E7', gradient: ['#F4F4F5', '#F4F4F5'] };
  }
  if (estiloKey === 'colorido') {
    return isDark ? { ...t, gradient: ['#1E1B4B', '#0F172A', '#064E3B'] } : { ...t, gradient: [accent.light + '44', '#F08A6C44'] };
  }
  return t;
}
