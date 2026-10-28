import React, { useState } from 'react';
import {
  X,
  UserCheck,
  KeyRound,
  Mail,
  Phone,
  Lock,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import { User, JenisKelamin } from '../../types';
import { StorageService } from '../../services/storage';
import { formatNamaPanggilan, bersihkanNama } from '../../utils/userUtils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUserUpdated: (user: User) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) => {
  const [nama, setNama] = useState(bersihkanNama(currentUser.nama));
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>(currentUser.jenisKelamin || 'Laki-laki');
  const [email, setEmail] = useState(currentUser.email);
  const [telepon, setTelepon] = useState(currentUser.telepon);
  const [nip, setNip] = useState(currentUser.nip || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nama.trim()) {
      setErrorMsg('Nama lengkap tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. If password fields are filled, validate & change password
      if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword) {
          setErrorMsg('Masukkan kata sandi saat ini (lama) untuk verifikasi keamanan.');
          setIsSubmitting(false);
          return;
        }

        if (!newPassword || newPassword.length < 8) {
          setErrorMsg('Kata sandi baru minimal harus 8 karakter.');
          setIsSubmitting(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
          setIsSubmitting(false);
          return;
        }

        const passRes = await StorageService.changeSelfPassword(
          currentUser.id,
          oldPassword,
          newPassword
        );

        if (!passRes.success) {
          setErrorMsg(passRes.message);
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Update profile information
      const profRes = StorageService.updateSelfProfile(currentUser.id, {
        nama: nama.trim(),
        jenisKelamin,
        email: email.trim(),
        telepon: telepon.trim(),
        nip: nip.trim(),
        avatar,
      });

      if (!profRes.success) {
        setErrorMsg(profRes.message);
        setIsSubmitting(false);
        return;
      }

      if (profRes.user) {
        onUserUpdated(profRes.user);
        setSuccessMsg('Profil dan data akun Anda berhasil diperbarui!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1300);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat memperbarui akun. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran foto profil maksimal 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className="px-6 py-4 text-white flex items-center justify-between"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <UserCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Profil Saya & Ganti Kata Sandi</h2>
              <p className="text-xs text-white/80">
                Kelola data pribadi akun dan perbarui kata sandi mandiri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar and Info */}
          <div className="flex items-center gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <img
              src={avatar || currentUser.avatar}
              alt={currentUser.nama}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                {formatNamaPanggilan(currentUser)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                @{currentUser.username} • {currentUser.jabatan}
              </p>
              <label className="inline-block mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                Ganti Foto Profil
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Muhammad Ramadhan, S.Pd., M.Pd."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Disimpan tanpa awalan; sapaan disematkan otomatis</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Kelamin *
              </label>
              <select
                value={jenisKelamin}
                onChange={(e) => setJenisKelamin(e.target.value as JenisKelamin)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
              >
                <option value="Laki-laki">Laki-laki (Sapaan: Ustadz)</option>
                <option value="Perempuan">Perempuan (Sapaan: Ustadzah)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-0.5">Menentukan sapaan resmi di sistem</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NIP / NIY
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Nomor Induk Pegawai"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Nomor HP / WhatsApp
              </label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Resmi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Password Change Section */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
              <KeyRound className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
              <span>Ganti Kata Sandi (Kosongkan bila tidak ingin diubah)</span>
            </div>

            {/* Old Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Kata Sandi Saat Ini (Lama) *
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  placeholder="Ketik kata sandi saat ini untuk konfirmasi"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Baru (Min. 8 karakter)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
