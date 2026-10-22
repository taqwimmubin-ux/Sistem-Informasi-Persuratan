import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  UserCheck,
  FileText,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  KeyRound,
  X,
  AlertCircle,
  Award,
  Check,
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { StorageService } from '../../services/storage';

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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Form Fields
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [role, setRole] = useState<UserRole>('waka_guru_staf');
  const [email, setEmail] = useState('');
  const [telepon, setTelepon] = useState('');
  const [avatar, setAvatar] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const openAddModal = () => {
    setEditingUser(null);
    setNama('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setNip('');
    setJabatan('');
    setRole('waka_guru_staf');
    setEmail('');
    setTelepon('');
    setAvatar('');
    setErrorMsg('');
    setShowAddModal(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setNama(u.nama);
    setUsername(u.username);
    setPassword('');
    setConfirmPassword('');
    setNip(u.nip || '');
    setJabatan(u.jabatan);
    setRole(u.role);
    setEmail(u.email);
    setTelepon(u.telepon);
    setAvatar(u.avatar || '');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nama.trim() || !username.trim()) {
      setErrorMsg('Nama dan Username wajib diisi.');
      return;
    }

    if (!editingUser) {
      // Adding new user requires password >= 8 characters
      if (!password || password.length < 8) {
        setErrorMsg('Kata sandi awal minimal harus 8 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok.');
        return;
      }

      const res = StorageService.addUser({
        nama,
        username: username.toLowerCase().trim(),
        password,
        nip,
        jabatan,
        role,
        email: email || `${username}@smpitbunayya.sch.id`,
        telepon: telepon || '0812-0000-0000',
        avatar:
          avatar ||
          `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        aktif: true,
      });

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
    } else {
      // Editing existing user
      if (password) {
        if (password.length < 8) {
          setErrorMsg('Kata sandi baru minimal harus 8 karakter.');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg('Konfirmasi kata sandi tidak cocok.');
          return;
        }
      }

      const updates: Partial<User> = {
        nama,
        username: username.toLowerCase().trim(),
        nip,
        jabatan,
        role,
        email,
        telepon,
      };

      if (avatar) updates.avatar = avatar;
      if (password) updates.password = password;

      const res = StorageService.updateUser(editingUser.id, updates);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }
    }

    setShowAddModal(false);
    onRefresh();
  };

  const handleToggleAktif = (u: User) => {
    StorageService.updateUser(u.id, { aktif: !u.aktif });
    onRefresh();
  };

  const handleDelete = () => {
    if (!deletingUserId) return;
    const res = StorageService.deleteUser(deletingUserId);
    setDeletingUserId(null);
    if (!res.success) {
      alert(res.message);
    }
    onRefresh();
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Admin / Operator
          </span>
        );
      case 'kepala_sekolah':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            Kepala Sekolah
          </span>
        );
      case 'waka_kurikulum':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Waka Kurikulum
          </span>
        );
      case 'waka_kesiswaan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            Waka Kesiswaan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300">
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-700" />
            Manajemen Pengguna & Hak Akses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun tenaga pendidik, pengaturan hak akses 5 role, dan keamanan kredensial
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">NIP / NIY</th>
                <th className="py-3 px-4">Jabatan Struktural</th>
                <th className="py-3 px-4">Role Akses</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.nama}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{u.nama}</p>
                        <p className="text-[11px] font-mono text-slate-500">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.nip || '-'}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{u.jabatan}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{getRoleBadge(u.role)}</td>
                  <td className="py-3 px-4 text-[11px] text-slate-500">
                    <div>{u.email}</div>
                    <div>{u.telepon}</div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleAktif(u)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        u.aktif
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {u.aktif ? 'Aktif' : 'Non-aktif'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Data Pengguna"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          const res = StorageService.resetUserPassword(u.id);
                          alert(res.message);
                          onRefresh();
                        }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Reset Kata Sandi ke Default (bunayya2026)"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => setDeletingUserId(u.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Delete User */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Pengguna</h3>
            <p className="text-xs text-slate-500 mt-1">
              Yakin ingin menghapus akun pengguna ini? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setDeletingUserId(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ustadzah Nurul Hidayah, S.Pd."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Login *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: nurul.kesiswaan"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NIY
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor Induk Yayasan"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jabatan Sekolah *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Wakil Kepala Sekolah Kesiswaan"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran / Hak Akses (Role) *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="admin">Admin / Operator (Akses Penuh)</option>
                    <option value="kepala_sekolah">Kepala Sekolah (Disposisi & Approval)</option>
                    <option value="waka_kurikulum">Wakil Kepala Kurikulum (Disposisi)</option>
                    <option value="waka_kesiswaan">Wakil Kepala Kesiswaan (Disposisi)</option>
                    <option value="waka_guru_staf">Waka Guru & Staf (Disposisi)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    placeholder="user@smpitbunayya.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor HP / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="0812-..."
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <p className="font-bold text-slate-800">
                  {editingUser
                    ? 'Ubah Kata Sandi (Kosongkan bila tidak ingin diubah):'
                    : 'Kata Sandi Akun (Minimal 8 Karakter) *:'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="password"
                      placeholder="Minimal 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Konfirmasi kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Foto Profil Pengguna (Maks 2 MB)
                </label>
                <div className="flex items-center gap-3">
                  {avatar && (
                    <img
                      src={avatar}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-300"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingUser ? 'Simpan Perubahan' : 'Buat Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
