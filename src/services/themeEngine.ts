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
    name: 'Hijau Zamrud Bunayya',
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#ecfdf5',
    primaryDark: '#064e3b',
    sidebarStart: '#0f172a',
    sidebarMid: '#064e3b',
    sidebarEnd: '#022c22',
    description: 'Nuansa Islami resmi khas SMPIT Bunayya (Hijau Zaitun Zamrud)',
  },
  {
    id: 'blue',
    name: 'Biru Laut Samudra',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#eff6ff',
    primaryDark: '#1e3a8a',
    sidebarStart: '#0f172a',
    sidebarMid: '#1e3a8a',
    sidebarEnd: '#172554',
    description: 'Karakter kedinasan formal, terpercaya, dan modern',
  },
  {
    id: 'teal',
    name: 'Teal Bahari Modern',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryLight: '#f0fdfa',
    primaryDark: '#134e4a',
    sidebarStart: '#0f172a',
    sidebarMid: '#115e59',
    sidebarEnd: '#042f2e',
    description: 'Perpaduan segar hijau toska dan biru laut berwibawa',
  },
  {
    id: 'purple',
    name: 'Ungu Royalti Kesultanan',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryLight: '#f5f3ff',
    primaryDark: '#4c1d95',
    sidebarStart: '#0f172a',
    sidebarMid: '#4c1d95',
    sidebarEnd: '#2e1065',
    description: 'Elegan, terpelajar, dan prestisius untuk lingkungan akademik',
  },
  {
    id: 'amber',
    name: 'Cokelat Kayu Manis',
    primary: '#b45309',
    primaryHover: '#92400e',
    primaryLight: '#fffbeb',
    primaryDark: '#78350f',
    sidebarStart: '#1c1917',
    sidebarMid: '#451a03',
    sidebarEnd: '#291e13',
    description: 'Hangat, klasik pesantren modern, dan bersahaja',
  },
  {
    id: 'maroon',
    name: 'Merah Marun Kehormatan',
    primary: '#b91c1c',
    primaryHover: '#991b1b',
    primaryLight: '#fef2f2',
    primaryDark: '#7f1d1d',
    sidebarStart: '#18181b',
    sidebarMid: '#7f1d1d',
    sidebarEnd: '#450a0a',
    description: 'Tegas, berani, dan berdisiplin tinggi',
  },
  {
    id: 'orange',
    name: 'Oranye Surya Senja',
    primary: '#ea580c',
    primaryHover: '#c2410c',
    primaryLight: '#fff7ed',
    primaryDark: '#7c2d12',
    sidebarStart: '#18181b',
    sidebarMid: '#7c2d12',
    sidebarEnd: '#431407',
    description: 'Dinamis, penuh energi positif, dan ramah',
  },
  {
    id: 'slate',
    name: 'Abu-abu Gelap Minimalis',
    primary: '#475569',
    primaryHover: '#334155',
    primaryLight: '#f8fafc',
    primaryDark: '#1e293b',
    sidebarStart: '#090d16',
    sidebarMid: '#1e293b',
    sidebarEnd: '#0f172a',
    description: 'Monokromatik modern, netral, dan fokus tinggi',
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

    // Primary RGB for Tailwind alpha transparency
    const { r, g, b } = hexToRgb(config.primaryColor);
    root.style.setProperty('--theme-primary-rgb', `${r}, ${g}, ${b}`);

    // Toggle Dark Mode Class
    if (config.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
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
