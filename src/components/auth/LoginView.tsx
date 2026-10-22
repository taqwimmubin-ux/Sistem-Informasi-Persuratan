import React, { useState } from 'react';
import {
  Lock,
  UserCheck,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  LogIn,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { User, ProfilSekolah } from '../../types';
import { StorageService } from '../../services/storage';

interface LoginViewProps {
  sekolah: ProfilSekolah;
  allUsers: User[];
  onLoginSuccess: (user: User) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  sekolah,
  allUsers,
  onLoginSuccess,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const found = allUsers.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase()
      );

      if (!found) {
        StorageService.addLog(
          'LOGIN_FAILED',
          'Auth',
          `Percobaan login gagal untuk username tidak terdaftar: "${username}"`
        );
        setErrorMsg('Username tidak terdaftar dalam sistem.');
        setIsLoading(false);
        return;
      }

      if (!found.aktif) {
        StorageService.addLog(
          'LOGIN_BLOCKED',
          'Auth',
          `Percobaan login akun non-aktif: "${username}" (${found.nama})`
        );
        setErrorMsg('Akun ini telah dinonaktifkan oleh Administrator TU.');
        setIsLoading(false);
        return;
      }

      // Password check (demo standard password 'bunayya2026' or user's custom password)
      const correctPass = found.password || 'bunayya2026';
      if (password !== correctPass) {
        StorageService.addLog(
          'LOGIN_FAILED',
          'Auth',
          `Kata sandi salah untuk akun: @${found.username} (${found.nama})`
        );
        setErrorMsg('Kata sandi salah. Silakan periksa kembali.');
        setIsLoading(false);
        return;
      }

      // Login success!
      StorageService.setCurrentUser(found);
      setIsLoading(false);
      onLoginSuccess(found);
    }, 300);
  };

  const handleQuickDemoLogin = (user: User) => {
    setUsername(user.username);
    setPassword(user.password || 'bunayya2026');
    StorageService.setCurrentUser(user);
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-100 dark:bg-slate-950 transition-colors relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onToggleDarkMode}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand & Emblem Card */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo
              size="xl"
              showText={false}
              customLogoUrl={sekolah.logoUrl}
              namaSekolah={sekolah.namaSekolah}
            />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {sekolah.namaSekolah}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Sistem Informasi Persuratan Digital (E-Surat & Disposisi)
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Masuk ke Akun Anda
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Gunakan kredensial resmi sekolah untuk mengakses agenda persuratan
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: admin, kepsek, waka_kurikulum"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi akun"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>

          {/* Quick Demo Role Picker Chips */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
              <span>Pilih Cepat Akun Demo (5 Roles):</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(u)}
                  className="w-full text-left p-2 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={u.avatar}
                      alt={u.nama}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {u.nama}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        @{u.username} • {u.jabatan}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: 'var(--theme-primary-light)',
                      color: 'var(--theme-primary-dark)',
                    }}
                  >
                    Masuk
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500">
          SMPIT Bunayya • Sistem Informasi Tata Usaha & Kearsipan Surat Digital
        </p>
      </div>
    </div>
  );
};
