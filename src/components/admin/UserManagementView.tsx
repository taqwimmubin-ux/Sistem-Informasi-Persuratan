import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  FileText,
  Trash2,
  X,
  AlertCircle,
  Award,
  Check,
  Lock,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { User, UserRole, JenisKelamin } from '../../types';
import { StorageService } from '../../services/storage';
import { formatNamaPanggilan, bersihkanNama } from '../../utils/userUtils';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onRefresh: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onRefresh,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form Fields for Adding New User
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>('Laki-laki');
  const [username, setUsername] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [role, setRole] = useState<UserRole>('waka_kurikulum');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');
  const [avatar, setAvatar] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setNama('');
    setJenisKelamin('Laki-laki');
    setUsername('');
    setInitialPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setNip('');
    setJabatan('');
    setRole('waka_kurikulum');
    setEmail('');
    setTelepon('');
    setAvatar('');
    setErrorMsg('');
    setShowAddModal(true);
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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nama.trim() || !username.trim()) {
      setErrorMsg('Nama lengkap dan Username wajib diisi.');
      return;
    }

    if (!initialPassword || initialPassword.length < 8) {
      setErrorMsg('Kata sandi awal minimal harus 8 karakter.');
      return;
    }

    if (initialPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await StorageService.addUser(
        {
          nama: bersihkanNama(nama),
          jenisKelamin,
          username: username.trim(),
          nip: nip.trim(),
          jabatan: jabatan.trim() || 'Staf Tata Usaha',
          role,
          email: email.trim() || `${username.trim().replace(/\s+/g, '').toLowerCase()}@smpitbunayya.sch.id`,
          telepon: telepon.trim() || '0812-0000-0000',
          avatar:
            avatar ||
            (jenisKelamin === 'Perempuan'
              ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'),
          aktif: true,
        },
        initialPassword
      );

      if (!res.success) {
        setErrorMsg(res.message);
        setIsSubmitting(false);
        return;
      }

      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal menambahkan pengguna baru. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAktif = (u: User) => {
    if (u.id === currentUser.id) {
      alert('Anda tidak dapat menonaktifkan akun yang sedang aktif digunakan.');
      return;
    }
    const res = StorageService.toggleUserStatus(u.id, currentUser.id);
    if (!res.success) {
      alert(res.message);
    }
    onRefresh();
  };

  const handleDelete = () => {
    if (!deletingUser) return;
    const res = StorageService.deleteUser(deletingUser.id, currentUser.id);
    setDeletingUser(null);
    if (!res.success) {
      alert(res.message);
    }
    onRefresh();
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Admin / Operator
          </span>
        );
      case 'kepala_sekolah':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Kepala Sekolah
          </span>
        );
      case 'waka_kurikulum':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Waka Kurikulum
          </span>
        );
      case 'waka_kesiswaan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
            <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Waka Kesiswaan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Waka Guru & Staf
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
            Manajemen Pengguna & Hak Akses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola akun tenaga pendidik, pengaturan hak akses, dan status keaktifan pengguna
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto hover:opacity-95"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 rounded-2xl text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Kebijakan Privasi & Keamanan Akun</p>
          <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
            Demi menjaga kerahasiaan kearsipan dan akun pribadi, Administrator tidak dapat melihat,
            mengubah profil, atau mereset kata sandi pengguna lain. Setiap pengguna mengelola biodata
            dan kata sandi masing-masing melalui menu <strong>Profil Saya</strong>. Pengguna baru
            diberikan kata sandi awal sementara dan diwajibkan menyetel kata sandi personal pada saat
            pertama kali masuk.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[11px]">
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">NIP / NIY</th>
                <th className="py-3.5 px-4">Jabatan Struktural</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4">Kontak</th>
                <th className="py-3.5 px-4">Status Akun</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => {
                const isSelf = u.id === currentUser.id;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.nama}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p
                            className="font-bold text-slate-900 dark:text-white truncate max-w-xs flex items-center gap-1.5"
                            title={formatNamaPanggilan(u)}
                          >
                            <span>{formatNamaPanggilan(u)}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold rounded">
                                Anda
                              </span>
                            )}
                            <span
                              className={`text-[10px] px-1.5 py-0.2 font-medium rounded ${
                                u.jenisKelamin === 'Perempuan'
                                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              }`}
                            >
                              {u.jenisKelamin === 'Perempuan' ? 'Perempuan' : 'Laki-laki'}
                            </span>
                          </p>
                          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            @{u.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {u.nip || '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {u.jabatan}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getRoleBadge(u.role)}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 dark:text-slate-400">
                      <div>{u.email}</div>
                      <div>{u.telepon}</div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAktif(u)}
                        disabled={isSelf}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                          u.aktif
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title={
                          isSelf
                            ? 'Tidak dapat menonaktifkan akun sendiri'
                            : u.aktif
                            ? 'Klik untuk menonaktifkan akun'
                            : 'Klik untuk mengaktifkan akun'
                        }
                      >
                        {u.aktif ? 'Aktif' : 'Non-aktif'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {!isSelf ? (
                          <button
                            onClick={() => setDeletingUser(u)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Akun Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic px-2">Akun Aktif</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Delete User */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Konfirmasi Hapus Pengguna
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Yakin ingin menghapus akun <strong>{formatNamaPanggilan(deletingUser)}</strong> (@
              {deletingUser.username})? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer"
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengguna Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div
              className="px-6 py-4 text-white flex items-center justify-between"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <UserPlus className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Tambah Pengguna Baru</h2>
                  <p className="text-xs text-white/80">
                    Daftarkan akun pendidik atau tenaga kependidikan baru
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleAddSubmit}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs"
            >
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Nurul Hidayah, S.Pd."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Disimpan tanpa Ustadz/Ustadzah</p>
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
                    <option value="Laki-laki">Laki-laki (Ustadz)</option>
                    <option value="Perempuan">Perempuan (Ustadzah)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username Akun *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: Waka kesiswaan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jabatan Struktural *
                  </label>
                  <input
                    type="text"
                    required
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Contoh: Waka Kesiswaan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Peran / Hak Akses (Role) *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                  >
                    <option value="admin">Admin / Operator TU (Akses Penuh)</option>
                    <option value="kepala_sekolah">Kepala Sekolah (Approval Surat & Disposisi)</option>
                    <option value="waka_kurikulum">Waka Kurikulum</option>
                    <option value="waka_kesiswaan">Waka Kesiswaan</option>
                    <option value="waka_guru_staf">Waka Guru & Staf</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIP / NIY
                  </label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Nomor induk"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@smpitbunayya.sch.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. WhatsApp
                  </label>
                  <input
                    type="text"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Temporary Password for newly added user */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Kata Sandi Awal Sementara (Wajib diisi)</span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                  Tentukan kata sandi awal (minimal 8 karakter). Pengguna baru akan diwajibkan
                  mengganti kata sandi ini saat pertama kali login ke dalam sistem demi privasi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Kata Sandi Awal *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={initialPassword}
                        onChange={(e) => setInitialPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
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
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ulangi Kata Sandi Awal *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Konfirmasi kata sandi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar file upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Foto Profil (Opsional)
                </label>
                <div className="flex items-center gap-3">
                  {avatar && (
                    <img
                      src={avatar}
                      alt="Avatar pratinjau"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleAvatarUpload}
                    className="text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Tambahkan Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
