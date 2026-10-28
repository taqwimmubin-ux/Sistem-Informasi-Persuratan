/**
 * Mesin Pengaturan Tema & Variabel CSS Sistem Persuratan SMPIT Bunayya
 * Menyediakan 8 Preset Siap Pakai + Color Picker Bebas + Mode Gelap/Terang
 */

export interface ThemePreset {
  id: string;
  name: string;
  primary: string; // Hex color
  primaryHover: string;
  primaryLight: string; // for light tinted badges/backgrounds
  primaryDark: string; // for high-contrast text or dark elements
  sidebarStart: string;
  sidebarMid: string;
  sidebarEnd: string;
  description: string;
}

export interface ActiveThemeConfig {
  presetId: string;
  primaryColor: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  sidebarStart: string;
  sidebarMid: string;
  sidebarEnd: string;
  isDark: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'emerald',
    name: 'Hijau Zamrud & Sage Mewah',
    primary: '#2F6F5E',
    primaryHover: '#23574A',
    primaryLight: '#E8F1ED',
    primaryDark: '#1B4036',
    sidebarStart: '#111E1A',
    sidebarMid: '#1A332C',
    sidebarEnd: '#13241F',
    description: 'Nuansa Islami modern, tenang, dan prestisius khas SMPIT Bunayya',
  },
  {
    id: 'blue',
    name: 'Biru Safir Ningrat',
    primary: '#275270',
    primaryHover: '#1D3F57',
    primaryLight: '#EAF1F5',
    primaryDark: '#142C3D',
    sidebarStart: '#0F1722',
    sidebarMid: '#162838',
    sidebarEnd: '#0F1C28',
    description: 'Karakter kedinasan formal, terpercaya, dan tenang berwibawa',
  },
  {
    id: 'teal',
    name: 'Teal Bahari Berwibawa',
    primary: '#236E67',
    primaryHover: '#19554F',
    primaryLight: '#E7F2F1',
    primaryDark: '#133F3B',
    sidebarStart: '#0E1D1B',
    sidebarMid: '#173633',
    sidebarEnd: '#102422',
    description: 'Perpaduan segar toska alami dan hijau laut dalam',
  },
  {
    id: 'purple',
    name: 'Ungu Kastil Kesultanan',
    primary: '#5B4B70',
    primaryHover: '#463957',
    primaryLight: '#EFEBF4',
    primaryDark: '#352B42',
    sidebarStart: '#17141C',
    sidebarMid: '#2B2335',
    sidebarEnd: '#1D1724',
    description: 'Elegan, teduh, terpelajar, dan prestisius untuk lingkungan akademik',
  },
  {
    id: 'amber',
    name: 'Cokelat Kayu Cendana',
    primary: '#855A36',
    primaryHover: '#69462A',
    primaryLight: '#F5ECE3',
    primaryDark: '#4A311D',
    sidebarStart: '#1E1712',
    sidebarMid: '#38271B',
    sidebarEnd: '#241911',
    description: 'Hangat, klasik pesantren modern bertaraf internasional',
  },
  {
    id: 'maroon',
    name: 'Merah Marun Beludru',
    primary: '#823737',
    primaryHover: '#662B2B',
    primaryLight: '#F5EAEB',
    primaryDark: '#4B2020',
    sidebarStart: '#1E1313',
    sidebarMid: '#3A1E1E',
    sidebarEnd: '#251313',
    description: 'Tegas, bersahaja, berkarakter mulia, dan berdisiplin tinggi',
  },
  {
    id: 'orange',
    name: 'Karamel Senja Keemasan',
    primary: '#9C5828',
    primaryHover: '#7C451F',
    primaryLight: '#F7EDE6',
    primaryDark: '#563016',
    sidebarStart: '#1F150F',
    sidebarMid: '#3B2314',
    sidebarEnd: '#26160C',
    description: 'Dinamis, penuh kehangatan, positif, dan ramah',
  },
  {
    id: 'slate',
    name: 'Abu Arang Keperakan',
    primary: '#435359',
    primaryHover: '#334045',
    primaryLight: '#EBF0F2',
    primaryDark: '#232D30',
    sidebarStart: '#101518',
    sidebarMid: '#20292E',
    sidebarEnd: '#141A1D',
    description: 'Monokromatik mewah, netral, seimbang, dan fokus tinggi',
  },
];

// Helper: Ubah HEX ke RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper: Geser kecerahan warna (lighten/darken)
function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));
  const nr = clamp(r + (255 - r) * (percent / 100));
  const ng = clamp(g + (255 - g) * (percent / 100));
  const nb = clamp(b + (255 - b) * (percent / 100));
  return `#${((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`;
}

function darkenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (val: number) => Math.min(255, Math.max(0, Math.round(val)));
  const factor = (100 - percent) / 100;
  const nr = clamp(r * factor);
  const ng = clamp(g * factor);
  const nb = clamp(b * factor);
  return `#${((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`;
}

export function generateCustomTheme(hexColor: string, isDark = false): ActiveThemeConfig {
  const primary = hexColor;
  const primaryHover = darkenColor(primary, 15);
  const primaryLight = isDark ? darkenColor(primary, 70) : adjustBrightness(primary, 92);
  const primaryDark = darkenColor(primary, 35);

  const sidebarMid = darkenColor(primary, 50);
  const sidebarEnd = darkenColor(primary, 75);

  return {
    presetId: 'custom',
    primaryColor: primary,
    primaryHover,
    primaryLight,
    primaryDark,
    sidebarStart: '#0b0f19',
    sidebarMid,
    sidebarEnd,
    isDark,
  };
}

const STORAGE_THEME_KEY = 'bny_theme_config_v2';

export const ThemeEngine = {
  getDefaultTheme(): ActiveThemeConfig {
    const defaultPreset = THEME_PRESETS[0];
    return {
      presetId: defaultPreset.id,
      primaryColor: defaultPreset.primary,
      primaryHover: defaultPreset.primaryHover,
      primaryLight: defaultPreset.primaryLight,
      primaryDark: defaultPreset.primaryDark,
      sidebarStart: defaultPreset.sidebarStart,
      sidebarMid: defaultPreset.sidebarMid,
      sidebarEnd: defaultPreset.sidebarEnd,
      isDark: false,
    };
  },

  getSavedTheme(): ActiveThemeConfig {
    try {
      const raw = localStorage.getItem(STORAGE_THEME_KEY);
      if (!raw) return this.getDefaultTheme();
      return JSON.parse(raw);
    } catch {
      return this.getDefaultTheme();
    }
  },

  saveTheme(config: ActiveThemeConfig): void {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(config));
      this.applyTheme(config);
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
  },

  applyTheme(config: ActiveThemeConfig): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Set CSS Custom Variables on :root
    root.style.setProperty('--theme-primary', config.primaryColor);
    root.style.setProperty('--theme-primary-hover', config.primaryHover);
    root.style.setProperty('--theme-primary-light', config.primaryLight);
    root.style.setProperty('--theme-primary-dark', config.primaryDark);
    root.style.setProperty('--theme-sidebar-start', config.sidebarStart);
    root.style.setProperty('--theme-sidebar-mid', config.sidebarMid);
    root.style.setProperty('--theme-sidebar-end', config.sidebarEnd);

    // Emas Champagne Lembut (#C9A96A) sebagai aksen tetap mewah
    root.style.setProperty('--theme-accent-gold', '#C9A96A');
    root.style.setProperty('--theme-accent-gold-light', '#F7F2E7');
    root.style.setProperty('--theme-accent-gold-dark', '#9B7E3E');
    root.style.setProperty('--theme-accent-gold-rgb', '201, 169, 106');

    // Primary RGB for Tailwind alpha transparency
    const { r, g, b } = hexToRgb(config.primaryColor);
    root.style.setProperty('--theme-primary-rgb', `${r}, ${g}, ${b}`);

    // Toggle Dark Mode Class & Palet Spesifik
    if (config.isDark) {
      root.classList.add('dark');
      root.style.setProperty('--app-bg', '#0F1A17'); // Hijau-arang kebiruan lembut
      root.style.setProperty('--app-card-bg', '#15231F');
      root.style.setProperty('--app-card-border', '#243A32');
      root.style.setProperty('--app-text-primary', '#F7F5F0');
      root.style.setProperty('--app-text-secondary', '#BAC9C2');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--app-bg', '#FAF8F4'); // Krem / putih gading hangat
      root.style.setProperty('--app-card-bg', '#FFFFFF');
      root.style.setProperty('--app-card-border', 'rgba(47, 111, 94, 0.12)');
      root.style.setProperty('--app-text-primary', '#1B2D27');
      root.style.setProperty('--app-text-secondary', '#52665F');
    }

    // Set data attribute for semantic targeting
    root.setAttribute('data-theme-preset', config.presetId);
    root.setAttribute('data-theme-mode', config.isDark ? 'dark' : 'light');
  },

  toggleDarkMode(currentConfig: ActiveThemeConfig): ActiveThemeConfig {
    const updated: ActiveThemeConfig = {
      ...currentConfig,
      isDark: !currentConfig.isDark,
      primaryLight: !currentConfig.isDark
        ? darkenColor(currentConfig.primaryColor, 70)
        : adjustBrightness(currentConfig.primaryColor, 92),
    };
    this.saveTheme(updated);
    return updated;
  },

  resetToDefault(): ActiveThemeConfig {
    const defaultTheme = this.getDefaultTheme();
    this.saveTheme(defaultTheme);
    return defaultTheme;
  },
};
