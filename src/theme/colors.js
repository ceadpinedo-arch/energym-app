export const light = {
  bg: '#EDEAF9',
  surface: '#FFFFFF',
  border: '#E4E1F0',
  textPrimary: '#1A1A1A',
  textSecondary: '#8B889B',
  primary: '#534AB7',
  onPrimary: '#FFFFFF',
  primaryBg: '#EEEDFE',
  success: '#3B6D11',
  successBg: '#EAF3DE',
  warning: '#854F0B',
  warningBg: '#FAEEDA',
  danger: '#A32D2D',
  dangerBg: '#FCEBEB',
};

export const dark = {
  bg: '#1E1B2E',
  surface: '#26213B',
  border: '#3C3459',
  textPrimary: '#F1EFE8',
  textSecondary: '#B4B2A9',
  primary: '#AFA9EC',
  onPrimary: '#26213B',
  primaryBg: '#3C3459',
  success: '#97C459',
  successBg: '#173404',
  warning: '#FAC775',
  warningBg: '#412402',
  danger: '#F09595',
  dangerBg: '#501313',
};

// Hook simple: reemplazar por useColorScheme() de React Native
// combinado con la preferencia guardada del usuario (claro / oscuro / auto).
export function getTheme(isDark) {
  return isDark ? dark : light;
}
