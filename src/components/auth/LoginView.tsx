import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  Sun,
  Moon,
  Clock,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { User, ProfilSekolah } from '../../types';
import { StorageService } from '../../services/storage';
import { AuthService } from '../../services/authService';

interface LoginViewProps {
  sekolah: ProfilSekolah;
  onLoginSuccess: (user: User) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  sessionExpiredNotice?: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({
  sekolah,
  onLoginSuccess,
  isDarkMode,
  onToggleDarkMode,
  sessionExpiredNotice,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Bersihkan lockout sisa versi lama bila ada di browser
  useEffect(() => {
    try {
      localStorage.removeItem('bny_auth_lockout_v4');
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Username atau kata sandi salah. Silakan coba lagi.');
      setPassword('');
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 10);
      return;
    }

    setIsLoading(true);

    try {
      const cleanUsername = username.trim().replace(/\s+/g, ' ').toLowerCase();
      const users = StorageService.getUsers();
      const found = users.find(
        (u) => u.username.trim().replace(/\s+/g, ' ').toLowerCase() === cleanUsername
      );

      if (!found) {
        // Catat percobaan gagal di log audit
        StorageService.addLog(
          'LOGIN_FAILED',
          'Auth',
          `Percobaan masuk gagal: username tidak terdaftar ("${username.trim()}")`
        );
        setErrorMsg('Username atau kata sandi salah. Silakan coba lagi.');
        setPassword('');
        setIsLoading(false);
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 10);
        return;
      }

      // Periksa status aktif akun
      if (!found.aktif) {
        StorageService.addLog(
          'LOGIN_BLOCKED',
          'Auth',
          `Percobaan masuk akun non-aktif: @${found.username} (${found.nama})`
        );
        setErrorMsg('Akun ini telah dinonaktifkan oleh Administrator TU.');
        setPassword('');
        setIsLoading(false);
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 10);
        return;
      }

      // Verifikasi kata sandi via Web Crypto SHA-256
      const isValid = await AuthService.verifyPassword(
        password,
        found.passwordHash,
        found.passwordSalt
      );

      if (!isValid) {
        StorageService.addLog(
          'LOGIN_FAILED',
          'Auth',
          `Percobaan masuk gagal: kata sandi salah untuk akun @${found.username}`
        );
        setErrorMsg('Username atau kata sandi salah. Silakan coba lagi.');
        setPassword('');
        setIsLoading(false);
        setTimeout(() => {
          passwordInputRef.current?.focus();
        }, 10);
        return;
      }

      // Login berhasil: inisialisasi sesi dan catat log
      AuthService.startSession(found);
      StorageService.setCurrentUser(found);
      StorageService.addLog(
        'LOGIN_SUCCESS',
        'Auth',
        `Login berhasil: ${found.nama} (@${found.username} - ${found.role})`
      );

      setIsLoading(false);
      onLoginSuccess(found);
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      setErrorMsg('Username atau kata sandi salah. Silakan coba lagi.');
      setPassword('');
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 10);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-100 dark:bg-slate-950 transition-colors relative selection:bg-emerald-500 selection:text-white">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onToggleDarkMode}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          aria-label="Ubah tema gelap terang"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
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
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Sistem Informasi Persuratan Digital (E-Surat & Disposisi)
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
              <span>Masuk ke Akun Anda</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Masukkan username dan kata sandi resmi sekolah untuk mengakses sistem
            </p>
          </div>

          {/* Session Inactivity Timeout Notice */}
          {sessionExpiredNotice && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-xl text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{sessionExpiredNotice}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ketik username Anda"
                  autoComplete="username"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 transition-all"
                />
              </div>
            </div>

            {/* Password Input with show/hide toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik kata sandi Anda"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900 transition-all"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer disabled:opacity-50"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk'}</span>
            </button>
          </form>

          {/* Privacy & Security Note */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Kerahasiaan akun dilindungi enkripsi hash satu arah. Pastikan Anda tidak membagikan kata
              sandi kepada pihak lain.
            </p>
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
