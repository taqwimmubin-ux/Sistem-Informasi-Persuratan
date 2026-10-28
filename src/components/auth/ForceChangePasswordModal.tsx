import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Check, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';

interface ForceChangePasswordModalProps {
  isOpen: boolean;
  currentUser: User;
  onPasswordChanged: (updatedUser: User) => void;
}

export const ForceChangePasswordModal: React.FC<ForceChangePasswordModalProps> = ({
  isOpen,
  currentUser,
  onPasswordChanged,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('Kata sandi baru minimal harus 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await StorageService.forceChangePassword(currentUser.id, newPassword);
      if (!res.success || !res.user) {
        setErrorMsg(res.message || 'Gagal menyimpan kata sandi.');
        setIsSubmitting(false);
        return;
      }

      onPasswordChanged(res.user);
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kendala saat memperbarui kata sandi. Silakan coba kembali.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div
          className="px-6 py-5 text-white"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <ShieldAlert className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Wajib Ganti Kata Sandi</h2>
              <p className="text-xs text-white/80">
                Penyetelan kata sandi personal untuk login pertama kali
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 rounded-2xl text-xs leading-relaxed">
            Ahlan wa sahlan, <strong>{currentUser.nama}</strong>! Akun Anda masih menggunakan kata
            sandi sementara dari Administrator TU. Demi privasi kearsipan persuratan, silakan
            tentukan kata sandi personal Anda sekarang.
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
                Kata Sandi Baru (Min. 8 karakter) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik kata sandi personal baru"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Konfirmasi Kata Sandi Baru *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:opacity-95 disabled:opacity-50"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Kata Sandi & Lanjutkan'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
