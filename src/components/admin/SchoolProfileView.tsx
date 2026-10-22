import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Check,
  Building,
  Mail,
  Phone,
  Globe,
  UserCheck,
  Upload,
  Trash2,
  Image as ImageIcon,
  Palette,
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  AlertCircle,
  Eye,
  Undo2,
  Sliders,
  FileText,
} from 'lucide-react';
import { ProfilSekolah } from '../../types';
import { StorageService } from '../../services/storage';
import {
  ThemeEngine,
  THEME_PRESETS,
  ActiveThemeConfig,
  generateCustomTheme,
} from '../../services/themeEngine';
import { compressAndValidateLogo } from '../../services/imageCompression';

interface SchoolProfileViewProps {
  sekolah: ProfilSekolah;
  onRefresh: () => void;
  onThemeChanged?: () => void;
}

export const SchoolProfileView: React.FC<SchoolProfileViewProps> = ({
  sekolah,
  onRefresh,
  onThemeChanged,
}) => {
  const [formData, setFormData] = useState<ProfilSekolah>(sekolah);
  const [logoPreview, setLogoPreview] = useState<string>(sekolah.logoUrl || '');
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // Field inline validation errors
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Active saved theme vs preview theme state
  const [activeTheme, setActiveTheme] = useState<ActiveThemeConfig>(() =>
    ThemeEngine.getSavedTheme()
  );
  const [previewTheme, setPreviewTheme] = useState<ActiveThemeConfig>(() =>
    ThemeEngine.getSavedTheme()
  );
  const [customHex, setCustomHex] = useState<string>(
    activeTheme.presetId === 'custom' ? activeTheme.primaryColor : '#059669'
  );
  const [hasUnsavedThemeChanges, setHasUnsavedThemeChanges] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if prop changes from parent
  useEffect(() => {
    setFormData(sekolah);
    setLogoPreview(sekolah.logoUrl || '');
  }, [sekolah]);

  const handleChange = (field: keyof ProfilSekolah, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    // Clear inline error on edit
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // --- LOGO HANDLING WITH CLIENT-SIDE COMPRESSION & VALIDATION ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setInfoMsg(null);
    setIsCompressingLogo(true);

    try {
      const res = await compressAndValidateLogo(file);
      if (!res.success) {
        setFieldErrors((prev) => ({
          ...prev,
          logo: res.message || 'Berkas logo tidak valid.',
        }));
        setIsCompressingLogo(false);
        return;
      }

      // Clear logo error if valid
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.logo;
        return copy;
      });

      if (res.base64) {
        setLogoPreview(res.base64);
        handleChange('logoUrl', res.base64);
        setInfoMsg(
          res.message || 'Logo baru berhasil dimuat. Klik "Simpan Seluruh Pengaturan" untuk menetapkan.'
        );
      }
    } catch (err: any) {
      setFieldErrors((prev) => ({
        ...prev,
        logo: err?.message || 'Terjadi kesalahan saat memproses gambar.',
      }));
    } finally {
      setIsCompressingLogo(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemoveLogo = () => {
    if (confirm('Kembalikan logo ke lambang resmi standar SMPIT Bunayya?')) {
      setLogoPreview('');
      handleChange('logoUrl', '');
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy.logo;
        return copy;
      });
      setInfoMsg('Logo kustom dihapus dari draf. Klik "Simpan Seluruh Pengaturan" untuk menetapkan.');
    }
  };

  // --- THEME LIVE PREVIEW & HANDLING ---
  const handleSelectPreset = (presetId: string) => {
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    const newPreview: ActiveThemeConfig = {
      presetId: found.id,
      primaryColor: found.primary,
      primaryHover: found.primaryHover,
      primaryLight: found.primaryLight,
      primaryDark: found.primaryDark,
      sidebarStart: found.sidebarStart,
      sidebarMid: found.sidebarMid,
      sidebarEnd: found.sidebarEnd,
      isDark: previewTheme.isDark,
    };

    setPreviewTheme(newPreview);
    setCustomHex(found.primary);
    setHasUnsavedThemeChanges(true);
    ThemeEngine.applyTheme(newPreview);
  };

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex);
    const newPreview = generateCustomTheme(hex, previewTheme.isDark);
    setPreviewTheme(newPreview);
    setHasUnsavedThemeChanges(true);
    ThemeEngine.applyTheme(newPreview);
  };

  const handleTogglePreviewDarkMode = () => {
    const updated: ActiveThemeConfig = {
      ...previewTheme,
      isDark: !previewTheme.isDark,
    };
    setPreviewTheme(updated);
    setHasUnsavedThemeChanges(true);
    ThemeEngine.applyTheme(updated);
  };

  const handleCancelThemePreview = () => {
    setPreviewTheme(activeTheme);
    setCustomHex(activeTheme.primaryColor);
    setHasUnsavedThemeChanges(false);
    ThemeEngine.applyTheme(activeTheme);
    setInfoMsg('Pratinjau tema dibatalkan. Mengembalikan ke tema aktif.');
    setTimeout(() => setInfoMsg(null), 3000);
  };

  const handleResetThemeToDefault = () => {
    if (confirm('Kembalikan tema ke pengaturan awal (Hijau Zamrud & Mode Terang)?')) {
      const def = ThemeEngine.resetToDefault();
      setActiveTheme(def);
      setPreviewTheme(def);
      setCustomHex(def.primaryColor);
      setHasUnsavedThemeChanges(false);
      onThemeChanged?.();
      setSaveSuccess('Tema antarmuka berhasil direset ke standar Bunayya!');
      setTimeout(() => setSaveSuccess(null), 3500);
    }
  };

  // --- BATALKAN SELURUH FORM (RESTORE LAST SAVED DATA) ---
  const handleCancelAllForm = () => {
    if (confirm('Batalkan seluruh perubahan dan kembalikan ke data yang tersimpan terakhir?')) {
      setFormData(sekolah);
      setLogoPreview(sekolah.logoUrl || '');
      setFieldErrors({});
      setErrorMsg(null);
      setInfoMsg('Formulir telah dikembalikan ke data tersimpan terakhir.');
      // Revert theme preview
      handleCancelThemePreview();
      setTimeout(() => setInfoMsg(null), 3000);
    }
  };

  // --- SUBMIT FULL SETTINGS & LOGO (ONE SINGLE SAVE BUTTON) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaveSuccess(null);
    setInfoMsg(null);

    // 1. Validation
    const errors: { [key: string]: string } = {};
    if (!formData.namaSekolah || !formData.namaSekolah.trim()) {
      errors.namaSekolah = 'Nama sekolah resmi wajib diisi.';
    }
    if (!formData.kepalaSekolah || !formData.kepalaSekolah.trim()) {
      errors.kepalaSekolah = 'Nama kepala sekolah wajib diisi.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Mohon periksa kolom yang ditandai dengan pesan peringatan.');
      return;
    }

    setIsSaving(true);

    try {
      // 2. Save Theme permanently
      ThemeEngine.saveTheme(previewTheme);
      setActiveTheme(previewTheme);
      setHasUnsavedThemeChanges(false);

      // 3. Prepare full school data
      const updatedSekolah: ProfilSekolah = {
        ...formData,
        namaSekolah: formData.namaSekolah.trim(),
        logoUrl: logoPreview,
        temaWarna: previewTheme.presetId,
      };

      // 4. Save to storage with IndexedDB fallback for heavy base64
      const res = await StorageService.saveSekolahWithLogo(updatedSekolah);
      if (!res.success) {
        setErrorMsg(res.message);
        setIsSaving(false);
        return;
      }

      setSaveSuccess(
        'Pengaturan lembaga, identitas dinas, format kop surat, tema warna, dan logo berhasil disimpan secara permanen!'
      );
      setTimeout(() => setSaveSuccess(null), 4500);

      // 5. Instantly broadcast updates to entire application shell without page refresh
      onThemeChanged?.();
      onRefresh();
    } catch (err: any) {
      console.error('Gagal menyimpan profil sekolah:', err);
      setErrorMsg(`Terjadi kegagalan penyimpanan: ${err?.message || 'Memori browser penuh'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
            Pengaturan Lembaga, Logo & Tema Warna
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola logo resmi sekolah, 8 pilihan tema warna antarmuka, mode terang/gelap, serta teks kop surat cetak
          </p>
        </div>

        {hasUnsavedThemeChanges && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-semibold animate-pulse">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>Mode Pratinjau Tema Aktif</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-6 transition-colors">
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-700 rounded-xl text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SECTION 1: LOGO SEKOLAH RESMI */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                Logo Resmi Lembaga Sekolah
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Logo langsung tampil di Sidebar, Header navigasi, Halaman Login, Kop Surat Keluar, Lembar Disposisi, dan Laporan
              </p>
            </div>

            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Logo Kustom (Kembali ke Bawaan)
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Logo Preview Square */}
            <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 flex items-center justify-center p-2.5 shadow-xs overflow-hidden shrink-0 relative group">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Pratinjau Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60" />
                  <span className="text-[10px] block font-semibold">Lambang Bawaan</span>
                  <span className="text-[8px] block opacity-80">(Emblem Bunayya)</span>
                </div>
              )}

              {isCompressingLogo && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
                  <RefreshCw className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Action buttons & description */}
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                id="school-logo-input"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <label
                  htmlFor="school-logo-input"
                  className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Upload className="w-4 h-4" />
                  {logoPreview ? 'Ganti Berkas Logo Baru' : 'Unggah Logo Sekolah'}
                </label>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    Pilih Berkas Lain
                  </button>
                )}
              </div>

              {fieldErrors.logo && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.logo}
                </p>
              )}

              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <p>
                  • Format yang didukung: <span className="font-semibold text-slate-700 dark:text-slate-300">PNG transparan, JPG/JPEG, SVG, WebP</span> (Maksimal 2 MB).
                </p>
                <p>
                  • Sistem secara otomatis mengompresi gambar tanpa mengurangi ketajaman kop cetak dan menyimpannya secara permanen di database lokal browser.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: TEMA WARNA & MODE TAMPILAN */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Palette className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                Tema Warna & Mode Tampilan Antarmuka
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih dari 8 preset warna terintegrasi atau tentukan warna kustom bebas dengan Color Picker
              </p>
            </div>

            {/* Dark / Light Mode Switch inside settings */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mode:</span>
              <button
                type="button"
                onClick={handleTogglePreviewDarkMode}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
              >
                {previewTheme.isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Mode Gelap (Aktif)</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-600" />
                    <span>Mode Terang (Aktif)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 8 Preset Warna Siap Pakai */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              8 Pilihan Tema Siap Pakai:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {THEME_PRESETS.map((preset) => {
                const isSelected = previewTheme.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-2 ring-2 shadow-xs bg-white dark:bg-slate-900'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 bg-slate-100/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300'
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: preset.primary,
                          }
                        : {}
                    }
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full shadow-xs shrink-0"
                          style={{ backgroundColor: preset.primary }}
                        ></span>
                        <span className="text-xs font-bold truncate">{preset.name}</span>
                      </div>
                      {isSelected && (
                        <Check
                          className="w-4 h-4 shrink-0 font-bold"
                          style={{ color: preset.primary }}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Picker Kustom Bebas */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer overflow-hidden p-0.5 bg-transparent"
                  title="Klik untuk memilih warna bebas"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
                  Pemilih Warna Bebas (Color Picker)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                  Kode Hex: {previewTheme.primaryColor.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {hasUnsavedThemeChanges && (
                <button
                  type="button"
                  onClick={handleCancelThemePreview}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  Batal Pratinjau
                </button>
              )}

              <button
                type="button"
                onClick={handleResetThemeToDefault}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                title="Kembalikan ke Hijau Zamrud Bunayya & Mode Terang"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Kembalikan ke Default
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: IDENTITAS POKOK SEKOLAH & KOP SURAT */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
            <Building className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            Identitas Pokok Lembaga & Format Kop Surat
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Sekolah Resmi *
              </label>
              <input
                type="text"
                value={formData.namaSekolah}
                onChange={(e) => handleChange('namaSekolah', e.target.value)}
                placeholder="Contoh: SMPIT BUNAYYA"
                className={`w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                  fieldErrors.namaSekolah
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-slate-400'
                }`}
              />
              {fieldErrors.namaSekolah && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {fieldErrors.namaSekolah}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Yayasan Penyelenggara *
              </label>
              <input
                type="text"
                value={formData.yayasan}
                onChange={(e) => handleChange('yayasan', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NPSN (Nomor Pokok Sekolah Nasional)
              </label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => handleChange('npsn', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Akreditasi Sekolah
              </label>
              <input
                type="text"
                value={formData.akreditasi}
                onChange={(e) => handleChange('akreditasi', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Format Penomoran Surat Keluar (Kop Resmi)
              </label>
              <input
                type="text"
                value={formData.formatNomorSuratKeluar || '{nomor}/SMPIT-BNY/{romawi}/{tahun}'}
                onChange={(e) => handleChange('formatNomorSuratKeluar', e.target.value)}
                placeholder="Contoh: {nomor}/SMPIT-BNY/{romawi}/{tahun}"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Gunakan variabel penomoran otomatis: <code>{'{nomor}'}</code>, <code>{'{romawi}'}</code>, dan <code>{'{tahun}'}</code>
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 4: ALAMAT & DOMISILI */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Alamat Lengkap & Domisili Lembaga
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Jalan / Kompleks Gedung
              </label>
              <input
                type="text"
                value={formData.alamat}
                onChange={(e) => handleChange('alamat', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                value={formData.kecamatan}
                onChange={(e) => handleChange('kecamatan', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={formData.kotaKabupaten}
                onChange={(e) => handleChange('kotaKabupaten', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Provinsi & Kode Pos
              </label>
              <input
                type="text"
                value={`${formData.provinsi || ''} ${formData.kodePos || ''}`}
                onChange={(e) => handleChange('provinsi', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: KONTAK & PIMPINAN */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            Kontak Resmi & Penandatangan Kepala Sekolah
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={formData.telepon}
                onChange={(e) => handleChange('telepon', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Tata Usaha
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                Website Resmi Sekolah
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kepala Sekolah & Gelar *
              </label>
              <input
                type="text"
                value={formData.kepalaSekolah}
                onChange={(e) => handleChange('kepalaSekolah', e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                  fieldErrors.kepalaSekolah
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-slate-400'
                }`}
              />
              {fieldErrors.kepalaSekolah && (
                <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {fieldErrors.kepalaSekolah}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button Save & Cancel */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Perubahan logo, identitas, dan tema warna akan langsung aktif di seluruh komponen aplikasi tanpa perlu me-refresh halaman.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCancelAllForm}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSaving || isCompressingLogo}
              className="w-full sm:w-auto px-6 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pengaturan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Seluruh Pengaturan Sekolah & Logo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
