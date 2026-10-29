import {
  User,
  ProfilSekolah,
  KategoriSurat,
  SuratMasuk,
  SuratKeluar,
  Disposisi,
  LogAktivitas,
  Notifikasi,
  Prestasi,
  StatusSuratKeluar,
  JenisKelamin,
} from '../types';
import {
  INITIAL_SEKOLAH,
  INITIAL_USERS,
  INITIAL_KATEGORI,
  INITIAL_SURAT_MASUK,
  INITIAL_SURAT_KELUAR,
  INITIAL_DISPOSISI,
  INITIAL_LOGS,
  INITIAL_NOTIFIKASI,
  INITIAL_PRESTASI,
} from '../data/seedData';
import { IndexedDBStorage } from './indexedDbStorage';
import { AuthService } from './authService';
import { bersihkanNama } from '../utils/userUtils';

const KEYS = {
  USERS: 'bny_users_v2',
  CURRENT_USER: 'bny_current_user_v2',
  SEKOLAH: 'bny_profil_sekolah_v2',
  KATEGORI: 'bny_kategori_v2',
  SURAT_MASUK: 'bny_surat_masuk_v2',
  SURAT_KELUAR: 'bny_surat_keluar_v2',
  DISPOSISI: 'bny_disposisi_v2',
  LOGS: 'bny_logs_v2',
  NOTIFIKASI: 'bny_notifikasi_v2',
  PRESTASI: 'bny_prestasi_v2',
};

const MIGRATION_KEY = 'bny_migration_v3_personel_names';

// Automatic Personnel & Account Name Migration for Browser Storage
function runPersonelNameMigration(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const migrated = localStorage.getItem(MIGRATION_KEY);
    if (migrated === 'v3_done') return;

    const replacements = [
      {
        oldStr: 'Dr. H. Ahmad Ridwan, M.Pd.I',
        newStr: "Sa'id Ramadhan, S.E., M.M., Gr., Al-Hafidz",
      },
      {
        oldStr: 'Ustadzah Fatimah Azzahra, S.Kom',
        newStr: 'Ustadz Muhammad Ramadhan, S.Pd., M.Pd.',
      },
      {
        oldStr: 'Ustadz Syahrul Ramadhan, M.Pd.',
        newStr: 'Saumiana, S.Pd., Gr.',
      },
      {
        oldStr: 'fatimah.tu@smpitbunayya.sch.id',
        newStr: 'ramadhan.tu@smpitbunayya.sch.id',
      },
      {
        oldStr: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        newStr: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      },
      {
        oldStr: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        newStr: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      },
      {
        oldStr: 'Ustadz Syahrul tolong koordinasi',
        newStr: 'Ustadzah Saumiana tolong koordinasi',
      },
    ];

    const storageKeys = Object.values(KEYS);
    for (const key of storageKeys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        let updated = raw;
        let modified = false;
        for (const item of replacements) {
          if (updated.includes(item.oldStr)) {
            updated = updated.replaceAll(item.oldStr, item.newStr);
            modified = true;
          }
        }
        if (modified) {
          localStorage.setItem(key, updated);
        }
      }
    }

    localStorage.setItem(MIGRATION_KEY, 'v3_done');
  } catch (err) {
    console.error('Error running personnel name migration:', err);
  }
}

// Run migration immediately upon loading
runPersonelNameMigration();

const SEKOLAH_MIGRATION_KEY = 'bny_migration_v7_sekolah_model_bunayya';

// Migration to enforce official school name "Sekolah Model SMPIT BUNAYYA" & official logo
function runSchoolModelMigration(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const migrated = localStorage.getItem(SEKOLAH_MIGRATION_KEY);
    if (migrated === 'v7_done') return;

    const raw = localStorage.getItem(KEYS.SEKOLAH);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        let modified = false;
        if (
          !parsed.namaSekolah ||
          parsed.namaSekolah === 'SMP ISLAM TERPADU BUNAYYA' ||
          parsed.namaSekolah === 'SMPIT BUNAYYA'
        ) {
          parsed.namaSekolah = 'Sekolah Model SMPIT BUNAYYA';
          modified = true;
        }
        if (!parsed.logoUrl || parsed.logoUrl.includes('AP8AAADGCAMAAAAqo6ad')) {
          parsed.logoUrl = '/logo-bunayya.png';
          modified = true;
        }
        if (modified) {
          localStorage.setItem(KEYS.SEKOLAH, JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }
    }
    localStorage.setItem(SEKOLAH_MIGRATION_KEY, 'v7_done');
  } catch (err) {
    console.error('Error running school model migration:', err);
  }
}

runSchoolModelMigration();

const AUTH_MIGRATION_KEY = 'bny_migration_v6_gender_sapaan_2026';

// Automatic Auth, Clean Names & Gender Migration (v6)
function runAuthAccountsMigration(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const migrated = localStorage.getItem(AUTH_MIGRATION_KEY);
    if (migrated === 'v6_done') return;

    const raw = localStorage.getItem(KEYS.USERS);
    let users: User[] = raw ? JSON.parse(raw) : [...INITIAL_USERS];

    // Remove legacy demo users: waka_kesiswaan and waka_guru_staf
    users = users.filter(
      (u) =>
        u.username !== 'waka_kesiswaan' &&
        u.username !== 'waka_guru_staf' &&
        u.id !== 'usr-4' &&
        u.id !== 'usr-5'
    );

    // Update canonical 3 seed accounts to new username, new SHA-256 hashed passwords, clean names & gender
    users = users.map((u) => {
      let seedMatch: User | undefined;
      if (u.id === 'usr-1' || u.role === 'admin' || u.username.toLowerCase() === 'admin' || u.username.toLowerCase() === 'admin123') {
        seedMatch = INITIAL_USERS[0];
      } else if (u.id === 'usr-2' || u.role === 'kepala_sekolah' || u.username.toLowerCase() === 'kepsek' || u.username.toLowerCase() === 'kepala sekolah') {
        seedMatch = INITIAL_USERS[1];
      } else if (u.id === 'usr-3' || u.role === 'waka_kurikulum' || u.username.toLowerCase() === 'kurikulum' || u.username.toLowerCase() === 'waka kurikulum' || u.username.toLowerCase() === 'waka_kurikulum') {
        seedMatch = INITIAL_USERS[2];
      }

      if (seedMatch) {
        return {
          ...u,
          id: seedMatch.id,
          username: seedMatch.username, // 'Admin123', 'Kepala sekolah', 'Waka kurikulum'
          nama: seedMatch.nama,
          jenisKelamin: seedMatch.jenisKelamin, // 'Laki-laki' / 'Perempuan'
          jabatan: seedMatch.jabatan,
          role: seedMatch.role,
          passwordSalt: seedMatch.passwordSalt,
          passwordHash: seedMatch.passwordHash,
          mustChangePassword: false,
          aktif: true,
        };
      }
      delete (u as any).password;
      return {
        ...u,
        nama: bersihkanNama(u.nama),
        jenisKelamin: u.jenisKelamin || 'Laki-laki',
      };
    });

    // Ensure all 3 canonical seed users exist
    for (const seed of INITIAL_USERS) {
      if (!users.some((u) => u.id === seed.id || u.role === seed.role)) {
        users.push(seed);
      }
    }

    localStorage.setItem(KEYS.USERS, JSON.stringify(users));

    const curRaw = localStorage.getItem(KEYS.CURRENT_USER);
    if (curRaw) {
      try {
        const curUser: User = JSON.parse(curRaw);
        const match = users.find((u) => u.id === curUser.id || u.role === curUser.role);
        if (match) {
          localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(match));
        } else {
          localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
        }
      } catch {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
      }
    }

    localStorage.setItem(AUTH_MIGRATION_KEY, 'v6_done');
  } catch (err) {
    console.error('Error running auth migration v6:', err);
  }
}

runAuthAccountsMigration();

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export const StorageService = {
  // Current logged in user
  getCurrentUser(): User {
    runPersonelNameMigration();
    const user = getLocal<User | null>(KEYS.CURRENT_USER, null);
    if (user) {
      // Ensure user name is updated if old name was cached
      if (user.nama === 'Ustadzah Fatimah Azzahra, S.Kom') {
        user.nama = 'Ustadz Muhammad Ramadhan, S.Pd., M.Pd.';
        user.avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80';
        setLocal(KEYS.CURRENT_USER, user);
      } else if (user.nama === 'Dr. H. Ahmad Ridwan, M.Pd.I') {
        user.nama = "Sa'id Ramadhan, S.E., M.M., Gr., Al-Hafidz";
        setLocal(KEYS.CURRENT_USER, user);
      } else if (user.nama === 'Ustadz Syahrul Ramadhan, M.Pd.') {
        user.nama = 'Saumiana, S.Pd., Gr.';
        user.avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
        setLocal(KEYS.CURRENT_USER, user);
      }
      return user;
    }
    const defaultUser = INITIAL_USERS[0];
    setLocal(KEYS.CURRENT_USER, defaultUser);
    return defaultUser;
  },

  setCurrentUser(user: User): void {
    setLocal(KEYS.CURRENT_USER, user);
    this.addLog('LOGIN', 'Auth', `Sesi pengguna beralih: ${user.nama} (${user.role})`);
  },

  // Users Management
  getUsers(): User[] {
    runPersonelNameMigration();
    runAuthAccountsMigration();
    const users = getLocal<User[]>(KEYS.USERS, INITIAL_USERS);
    let changed = false;
    for (const u of users) {
      if (u.nama === 'Ustadzah Fatimah Azzahra, S.Kom') {
        u.nama = 'Ustadz Muhammad Ramadhan, S.Pd., M.Pd.';
        u.avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80';
        changed = true;
      } else if (u.nama === 'Dr. H. Ahmad Ridwan, M.Pd.I') {
        u.nama = "Sa'id Ramadhan, S.E., M.M., Gr., Al-Hafidz";
        changed = true;
      } else if (u.nama === 'Ustadz Syahrul Ramadhan, M.Pd.') {
        u.nama = 'Saumiana, S.Pd., Gr.';
        u.avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
        changed = true;
      }
    }
    if (changed) {
      setLocal(KEYS.USERS, users);
    }
    return users;
  },

  saveUsers(users: User[]): void {
    setLocal(KEYS.USERS, users);
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  async addUser(
    newUser: Omit<User, 'id' | 'password' | 'passwordHash' | 'passwordSalt'>,
    initialPassword: string
  ): Promise<{ success: boolean; message: string; user?: User }> {
    const users = this.getUsers();
    // Validate unique username (case-insensitive & whitespace trimmed)
    const normalizedNew = newUser.username.trim().replace(/\s+/g, ' ').toLowerCase();
    if (users.some((u) => u.username.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedNew)) {
      return { success: false, message: 'Username sudah digunakan oleh akun lain.' };
    }
    // Validate password
    if (!initialPassword || initialPassword.length < 8) {
      return { success: false, message: 'Kata sandi awal minimal harus 8 karakter.' };
    }

    const salt = AuthService.generateSalt();
    const hash = await AuthService.hashPassword(initialPassword, salt);

    const created: User = {
      ...newUser,
      nama: bersihkanNama(newUser.nama),
      jenisKelamin: newUser.jenisKelamin || 'Laki-laki',
      username: newUser.username.trim(),
      id: `usr-${Date.now()}`,
      passwordSalt: salt,
      passwordHash: hash,
      mustChangePassword: true,
      aktif: true,
    };
    users.push(created);
    this.saveUsers(users);
    this.addLog('CREATE_USER', 'Pengguna', `Menambahkan pengguna baru: ${created.nama} (@${created.username})`);
    return { success: true, message: 'Pengguna baru berhasil ditambahkan.', user: created };
  },

  deleteUser(id: string, currentUserId: string): { success: boolean; message: string } {
    let users = this.getUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, message: 'Pengguna tidak ditemukan.' };

    if (target.id === currentUserId) {
      return { success: false, message: 'Tidak dapat menghapus akun yang sedang Anda gunakan.' };
    }

    if (target.role === 'admin') {
      const activeAdmins = users.filter((u) => u.role === 'admin' && u.aktif);
      if (activeAdmins.length <= 1) {
        return {
          success: false,
          message: 'Tidak dapat menghapus akun Admin terakhir. Sistem harus memiliki minimal satu Admin aktif.',
        };
      }
    }

    users = users.filter((u) => u.id !== id);
    this.saveUsers(users);
    this.addLog('DELETE_USER', 'Pengguna', `Menghapus akun pengguna: ${target.nama} (@${target.username})`);
    return { success: true, message: `Akun ${target.nama} berhasil dihapus.` };
  },

  toggleUserStatus(id: string, currentUserId: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return { success: false, message: 'Pengguna tidak ditemukan.' };

    if (users[idx].id === currentUserId) {
      return { success: false, message: 'Tidak dapat menonaktifkan akun yang sedang aktif Anda gunakan.' };
    }

    users[idx].aktif = !users[idx].aktif;
    this.saveUsers(users);
    this.addLog(
      'UPDATE_STATUS',
      'Pengguna',
      `Mengubah status akun ${users[idx].nama} (@${users[idx].username}) menjadi ${users[idx].aktif ? 'Aktif' : 'Non-aktif'}`
    );
    return {
      success: true,
      message: `Status akun ${users[idx].nama} berhasil diubah menjadi ${users[idx].aktif ? 'Aktif' : 'Non-aktif'}.`,
    };
  },

  updateSelfProfile(
    userId: string,
    data: {
      nama: string;
      jenisKelamin?: JenisKelamin;
      email: string;
      telepon: string;
      nip?: string;
      avatar?: string;
    }
  ): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return { success: false, message: 'Pengguna tidak ditemukan.' };

    users[idx] = {
      ...users[idx],
      nama: bersihkanNama(data.nama),
      jenisKelamin: data.jenisKelamin || users[idx].jenisKelamin || 'Laki-laki',
      email: data.email,
      telepon: data.telepon,
      nip: data.nip !== undefined ? data.nip : users[idx].nip,
      avatar: data.avatar || users[idx].avatar,
    };
    this.saveUsers(users);
    setLocal(KEYS.CURRENT_USER, users[idx]);
    this.addLog('UPDATE_PROFILE', 'Pengguna', `Pengguna memperbarui data profil pribadi: ${users[idx].nama}`);
    return { success: true, message: 'Profil Anda berhasil diperbarui.', user: users[idx] };
  },

  async changeSelfPassword(
    userId: string,
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return { success: false, message: 'Pengguna tidak ditemukan.' };

    const user = users[idx];
    const isOldValid = await AuthService.verifyPassword(oldPass, user.passwordHash, user.passwordSalt);
    if (!isOldValid) {
      return { success: false, message: 'Kata sandi saat ini (lama) tidak sesuai.' };
    }

    if (!newPass || newPass.length < 8) {
      return { success: false, message: 'Kata sandi baru minimal harus 8 karakter.' };
    }

    const newSalt = AuthService.generateSalt();
    const newHash = await AuthService.hashPassword(newPass, newSalt);

    users[idx] = {
      ...users[idx],
      passwordSalt: newSalt,
      passwordHash: newHash,
      mustChangePassword: false,
    };
    this.saveUsers(users);
    setLocal(KEYS.CURRENT_USER, users[idx]);
    this.addLog('CHANGE_PASSWORD', 'Auth', `Pengguna @${user.username} (${user.nama}) memperbarui kata sandi.`);
    return { success: true, message: 'Kata sandi Anda berhasil diperbarui.' };
  },

  async forceChangePassword(
    userId: string,
    newPass: string
  ): Promise<{ success: boolean; message: string; user?: User }> {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return { success: false, message: 'Pengguna tidak ditemukan.' };

    if (!newPass || newPass.length < 8) {
      return { success: false, message: 'Kata sandi baru minimal harus 8 karakter.' };
    }

    const newSalt = AuthService.generateSalt();
    const newHash = await AuthService.hashPassword(newPass, newSalt);

    users[idx] = {
      ...users[idx],
      passwordSalt: newSalt,
      passwordHash: newHash,
      mustChangePassword: false,
    };
    this.saveUsers(users);
    setLocal(KEYS.CURRENT_USER, users[idx]);
    this.addLog(
      'FIRST_PASSWORD_SET',
      'Auth',
      `Pengguna @${users[idx].username} (${users[idx].nama}) menyetel kata sandi personal pertamanya.`
    );
    return { success: true, message: 'Kata sandi baru berhasil disimpan.', user: users[idx] };
  },

  // School Profile & Branding
  getSekolah(): ProfilSekolah {
    runPersonelNameMigration();
    runSchoolModelMigration();
    const cached = getLocal<ProfilSekolah>(KEYS.SEKOLAH, INITIAL_SEKOLAH);
    let modified = false;

    if (
      !cached.namaSekolah ||
      cached.namaSekolah === 'SMP ISLAM TERPADU BUNAYYA' ||
      cached.namaSekolah === 'SMPIT BUNAYYA'
    ) {
      cached.namaSekolah = 'Sekolah Model SMPIT BUNAYYA';
      modified = true;
    }

    if (!cached.logoUrl || cached.logoUrl.includes('AP8AAADGCAMAAAAqo6ad')) {
      cached.logoUrl = '/logo-bunayya.png';
      modified = true;
    }

    if (cached.kepalaSekolah === 'Dr. H. Ahmad Ridwan, M.Pd.I') {
      cached.kepalaSekolah = "Sa'id Ramadhan, S.E., M.M., Gr., Al-Hafidz";
      modified = true;
    }

    if (modified) {
      setLocal(KEYS.SEKOLAH, cached);
    }
    return cached;
  },

  async loadSekolahAsync(): Promise<ProfilSekolah> {
    const cached = this.getSekolah();
    try {
      // Check if there is an indexedDB stored high-res logo
      const idbLogo = await IndexedDBStorage.getItem('school_logo_base64');
      if (idbLogo && idbLogo !== cached.logoUrl && !idbLogo.includes('AP8AAADGCAMAAAAqo6ad')) {
        cached.logoUrl = idbLogo;
        setLocal(KEYS.SEKOLAH, cached);
      }
    } catch (e) {
      console.warn('Could not read logo from IndexedDB:', e);
    }
    return cached;
  },

  async saveSekolahWithLogo(profil: ProfilSekolah): Promise<{ success: boolean; message: string }> {
    try {
      // 1. If logoUrl exists and is base64, store copy in IndexedDB
      if (profil.logoUrl && profil.logoUrl.startsWith('data:')) {
        await IndexedDBStorage.setItem('school_logo_base64', profil.logoUrl);
      } else if (!profil.logoUrl) {
        await IndexedDBStorage.removeItem('school_logo_base64');
      }

      // 2. If fotoGedungUrl exists and is base64, store copy in IndexedDB
      if (profil.fotoGedungUrl && profil.fotoGedungUrl.startsWith('data:')) {
        await IndexedDBStorage.setItem('school_building_photo', profil.fotoGedungUrl);
      } else if (!profil.fotoGedungUrl) {
        await IndexedDBStorage.removeItem('school_building_photo');
      }

      // 3. Save full profil into localStorage with quota catch
      try {
        setLocal(KEYS.SEKOLAH, profil);
      } catch (localErr: any) {
        console.warn('LocalStorage quota reached, keeping heavy images in IndexedDB:', localErr);
        const slimProfil = {
          ...profil,
          logoUrl: profil.logoUrl?.startsWith('data:') ? 'idb:school_logo_base64' : profil.logoUrl,
          fotoGedungUrl: profil.fotoGedungUrl?.startsWith('data:') ? 'idb:school_building_photo' : profil.fotoGedungUrl,
        };
        setLocal(KEYS.SEKOLAH, slimProfil);
      }

      this.addLog(
        'UPDATE_PROFIL_SEKOLAH',
        'Pengaturan',
        `Memperbarui profil, identitas dinas, dan logo sekolah: ${profil.namaSekolah}`
      );
      return { success: true, message: 'Profil dan logo sekolah berhasil disimpan secara permanen.' };
    } catch (err: any) {
      console.error('Error saving school profile:', err);
      return {
        success: false,
        message: `Gagal menyimpan data ke browser: ${err?.message || 'Memori penyimpanan penuh.'}`,
      };
    }
  },

  saveSekolah(profil: ProfilSekolah): void {
    try {
      setLocal(KEYS.SEKOLAH, profil);
      if (profil.logoUrl && profil.logoUrl.startsWith('data:')) {
        IndexedDBStorage.setItem('school_logo_base64', profil.logoUrl);
      } else if (!profil.logoUrl) {
        IndexedDBStorage.removeItem('school_logo_base64');
      }
      if (profil.fotoGedungUrl && profil.fotoGedungUrl.startsWith('data:')) {
        IndexedDBStorage.setItem('school_building_photo', profil.fotoGedungUrl);
      }
      this.addLog('UPDATE_PROFIL_SEKOLAH', 'Pengaturan', `Memperbarui profil, identitas, dan visi-misi sekolah: ${profil.namaSekolah}`);
    } catch (err) {
      console.error('Failed to save sekolah:', err);
    }
  },

  // Prestasi Siswa & Sekolah
  getPrestasi(): Prestasi[] {
    return getLocal<Prestasi[]>(KEYS.PRESTASI, INITIAL_PRESTASI);
  },

  savePrestasi(list: Prestasi[]): void {
    setLocal(KEYS.PRESTASI, list);
  },

  addPrestasi(item: Omit<Prestasi, 'id' | 'createdAt' | 'updatedAt'>): Prestasi {
    const list = this.getPrestasi();
    const now = new Date().toISOString();
    // Unique ID combining timestamp and random alphanumeric string
    const newItem: Prestasi = {
      ...item,
      id: `prs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newItem);
    this.savePrestasi(list);
    this.addLog(
      'CREATE_PRESTASI',
      'Prestasi',
      `Menambahkan prestasi tingkat ${newItem.tingkat}: "${newItem.judul}" (${newItem.peringkat}) oleh ${newItem.namaSiswa}`
    );
    return newItem;
  },

  updatePrestasi(id: string, updates: Partial<Prestasi>): Prestasi | null {
    const list = this.getPrestasi();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) {
      console.error(`Gagal memperbarui prestasi: ID "${id}" tidak ditemukan.`);
      return null;
    }
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    this.savePrestasi(list);
    this.addLog('UPDATE_PRESTASI', 'Prestasi', `Memperbarui data prestasi tingkat ${list[idx].tingkat}: "${list[idx].judul}"`);
    return list[idx];
  },

  deletePrestasi(id: string): { success: boolean; message: string } {
    let list = this.getPrestasi();
    const target = list.find((p) => p.id === id);
    if (!target) {
      console.error(`Gagal menghapus prestasi: ID "${id}" tidak ditemukan dalam penyimpanan.`);
      return { success: false, message: 'Data prestasi tidak ditemukan atau telah dihapus.' };
    }
    list = list.filter((p) => p.id !== id);
    this.savePrestasi(list);
    this.addLog(
      'DELETE_PRESTASI',
      'Prestasi',
      `Menghapus prestasi tingkat ${target.tingkat}: "${target.judul}" (${target.namaSiswa})`
    );
    return { success: true, message: `Prestasi "${target.judul}" berhasil dihapus.` };
  },

  // Notifikasi
  getNotifikasi(): Notifikasi[] {
    return getLocal<Notifikasi[]>(KEYS.NOTIFIKASI, INITIAL_NOTIFIKASI);
  },

  saveNotifikasi(list: Notifikasi[]): void {
    setLocal(KEYS.NOTIFIKASI, list);
  },

  addNotifikasi(item: Omit<Notifikasi, 'id' | 'createdAt' | 'dibaca'>): Notifikasi {
    const list = this.getNotifikasi();
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newNotif: Notifikasi = {
      ...item,
      id: `ntf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dibaca: false,
      createdAt: timeStr,
    };
    list.unshift(newNotif);
    // Keep max 100 notifications
    if (list.length > 100) list.pop();
    this.saveNotifikasi(list);
    return newNotif;
  },

  markNotifikasiAsRead(id: string): void {
    const list = this.getNotifikasi();
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx].dibaca = true;
      this.saveNotifikasi(list);
    }
  },

  markAllNotifikasiAsRead(userId: string): void {
    const list = this.getNotifikasi();
    list.forEach((n) => {
      if (n.userId === userId || n.userId === 'ALL') {
        n.dibaca = true;
      }
    });
    this.saveNotifikasi(list);
  },

  // Categories
  getKategori(): KategoriSurat[] {
    return getLocal<KategoriSurat[]>(KEYS.KATEGORI, INITIAL_KATEGORI);
  },

  saveKategori(list: KategoriSurat[]): void {
    setLocal(KEYS.KATEGORI, list);
  },

  addKategori(kat: Omit<KategoriSurat, 'id'>): KategoriSurat {
    const list = this.getKategori();
    const newItem: KategoriSurat = {
      ...kat,
      id: `kat-${Date.now()}`,
    };
    list.push(newItem);
    this.saveKategori(list);
    this.addLog('CREATE_KATEGORI', 'Master Data', `Menambah kategori surat: ${newItem.nama}`);
    return newItem;
  },

  deleteKategori(id: string): boolean {
    let list = this.getKategori();
    const target = list.find((k) => k.id === id);
    if (!target) return false;
    list = list.filter((k) => k.id !== id);
    this.saveKategori(list);
    this.addLog('DELETE_KATEGORI', 'Master Data', `Menghapus kategori surat: ${target.nama}`);
    return true;
  },

  // Surat Masuk
  getSuratMasuk(): SuratMasuk[] {
    return getLocal<SuratMasuk[]>(KEYS.SURAT_MASUK, INITIAL_SURAT_MASUK);
  },

  saveSuratMasuk(list: SuratMasuk[]): void {
    setLocal(KEYS.SURAT_MASUK, list);
  },

  getSuratMasukById(id: string): SuratMasuk | undefined {
    return this.getSuratMasuk().find((s) => s.id === id);
  },

  getNextNomorAgendaMasuk(): string {
    const list = this.getSuratMasuk();
    const year = new Date().getFullYear();
    const prefix = `AGM/${year}/`;
    let max = 0;
    list.forEach((item) => {
      if (item.nomorAgenda && item.nomorAgenda.startsWith(prefix)) {
        const numPart = item.nomorAgenda.replace(prefix, '');
        const val = parseInt(numPart, 10);
        if (!isNaN(val) && val > max) max = val;
      }
    });
    const nextNum = String(max + 1).padStart(3, '0');
    return `${prefix}${nextNum}`;
  },

  addSuratMasuk(data: Omit<SuratMasuk, 'id' | 'createdAt' | 'updatedAt'>): SuratMasuk {
    const list = this.getSuratMasuk();
    const now = new Date().toISOString();
    const newSurat: SuratMasuk = {
      ...data,
      id: `sm-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newSurat);
    this.saveSuratMasuk(list);
    this.addLog(
      'CREATE_SURAT_MASUK',
      'Surat Masuk',
      `Mencatat surat masuk baru No: ${newSurat.nomorSurat} dari ${newSurat.pengirim}`
    );

    // Push notification if Penting, Segera, or Rahasia
    if (newSurat.sifat === 'Penting' || newSurat.sifat === 'Segera' || newSurat.sifat === 'Rahasia') {
      this.addNotifikasi({
        userId: 'ALL',
        judul: `Surat Masuk Sifat ${newSurat.sifat}`,
        pesan: `Surat dari "${newSurat.pengirim}" perihal "${newSurat.perihal}" memerlukan perhatian segera.`,
        tipe: 'surat_masuk',
        tautanModul: 'surat-masuk',
        tautanId: newSurat.id,
      });
    }

    return newSurat;
  },

  updateSuratMasuk(id: string, updates: Partial<SuratMasuk>): SuratMasuk | null {
    const list = this.getSuratMasuk();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveSuratMasuk(list);
    this.addLog('UPDATE_SURAT_MASUK', 'Surat Masuk', `Memperbarui data surat masuk No: ${list[idx].nomorSurat}`);
    return list[idx];
  },

  deleteSuratMasuk(id: string): { success: boolean; message: string } {
    let list = this.getSuratMasuk();
    const target = list.find((s) => s.id === id);
    if (!target) return { success: false, message: 'Surat masuk tidak ditemukan.' };

    list = list.filter((s) => s.id !== id);
    this.saveSuratMasuk(list);

    // Clean up associated dispositions
    let disps = this.getDisposisi();
    disps = disps.filter((d) => d.suratMasukId !== id);
    this.saveDisposisi(disps);

    this.addLog('DELETE_SURAT_MASUK', 'Surat Masuk', `Menghapus surat masuk No: ${target.nomorSurat} (${target.perihal})`);
    return { success: true, message: `Surat masuk No: ${target.nomorSurat} berhasil dihapus.` };
  },

  // Disposisi
  getDisposisi(): Disposisi[] {
    return getLocal<Disposisi[]>(KEYS.DISPOSISI, INITIAL_DISPOSISI);
  },

  saveDisposisi(list: Disposisi[]): void {
    setLocal(KEYS.DISPOSISI, list);
  },

  getDisposisiBySuratMasukId(suratMasukId: string): Disposisi[] {
    return this.getDisposisi().filter((d) => d.suratMasukId === suratMasukId);
  },

  addDisposisi(data: Omit<Disposisi, 'id'>): Disposisi {
    const list = this.getDisposisi();
    const newDisposisi: Disposisi = {
      ...data,
      id: `dsp-${Date.now()}`,
    };
    list.unshift(newDisposisi);
    this.saveDisposisi(list);

    // Update status in surat masuk
    this.updateSuratMasuk(data.suratMasukId, {
      statusDisposisi: 'Sudah Didisposisi',
      idDisposisiTerakhir: newDisposisi.id,
    });

    const targetNames = data.tujuan.map((t) => t.nama).join(', ');
    this.addLog(
      'CREATE_DISPOSISI',
      'Disposisi',
      `Menerbitkan lembar disposisi No Surat: ${data.nomorSurat} kepada ${targetNames}`
    );

    // Send notifications to each assigned user!
    data.tujuan.forEach((tgt) => {
      this.addNotifikasi({
        userId: tgt.userId,
        judul: `Tugas Disposisi Baru (${data.prioritas})`,
        pesan: `Anda menerima tugas disposisi dari ${data.pemberiDisposisiNama} terkait: "${data.perihal}". Batas: ${data.batasWaktu}.`,
        tipe: 'disposisi',
        tautanModul: 'disposisi-saya',
        tautanId: newDisposisi.id,
      });
    });

    return newDisposisi;
  },

  updateTanggapanDisposisi(
    disposisiId: string,
    userId: string,
    status: 'Baru' | 'Dibaca' | 'Diproses' | 'Selesai',
    tanggapan?: string
  ): Disposisi | null {
    const list = this.getDisposisi();
    const idx = list.findIndex((d) => d.id === disposisiId);
    if (idx === -1) return null;

    const disp = list[idx];
    const targetIdx = disp.tujuan.findIndex((t) => t.userId === userId);
    let targetName = 'Staf';

    if (targetIdx !== -1) {
      targetName = disp.tujuan[targetIdx].nama;
      disp.tujuan[targetIdx].status = status;
      if (tanggapan !== undefined) {
        disp.tujuan[targetIdx].tanggapan = tanggapan;
      }
      if (status === 'Dibaca' && !disp.tujuan[targetIdx].tanggalDibaca) {
        disp.tujuan[targetIdx].tanggalDibaca = new Date().toLocaleString('id-ID');
      }
      if (status === 'Selesai') {
        disp.tujuan[targetIdx].tanggalSelesai = new Date().toLocaleString('id-ID');
      }
    }

    // Check overall global status
    const allDone = disp.tujuan.every((t) => t.status === 'Selesai');
    const anyInProcess = disp.tujuan.some((t) => t.status === 'Diproses' || t.status === 'Dibaca');
    if (allDone) {
      disp.statusGlobal = 'Selesai';
      this.updateSuratMasuk(disp.suratMasukId, { statusDisposisi: 'Selesai' });
    } else if (anyInProcess) {
      disp.statusGlobal = 'Diproses';
    }

    this.saveDisposisi(list);
    this.addLog(
      'UPDATE_DISPOSISI',
      'Disposisi',
      `Tindak lanjut disposisi No Surat: ${disp.nomorSurat} oleh ${targetName} menjadi '${status}'`
    );

    // Notify the issuer (Kepsek or Admin) that disposition was responded to!
    this.addNotifikasi({
      userId: disp.pemberiDisposisiId,
      judul: `Progres Disposisi: ${targetName} (${status})`,
      pesan: `Penerima disposisi (${targetName}) telah memperbarui status menjadi "${status}" untuk surat: "${disp.perihal}".`,
      tipe: 'disposisi',
      tautanModul: 'disposisi-saya',
      tautanId: disp.id,
    });

    return disp;
  },

  // Surat Keluar
  getSuratKeluar(): SuratKeluar[] {
    return getLocal<SuratKeluar[]>(KEYS.SURAT_KELUAR, INITIAL_SURAT_KELUAR);
  },

  saveSuratKeluar(list: SuratKeluar[]): void {
    setLocal(KEYS.SURAT_KELUAR, list);
  },

  getSuratKeluarById(id: string): SuratKeluar | undefined {
    return this.getSuratKeluar().find((s) => s.id === id);
  },

  getNextNomorSuratKeluar(): { nomorSurat: string; nomorAgenda: string } {
    const list = this.getSuratKeluar();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const roman = romanMonths[month - 1];

    let maxNum = 0;
    list.forEach((item) => {
      const match = item.nomorSurat.match(/^(\d+)\//);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxNum) maxNum = val;
      }
    });

    const nextCount = maxNum + 1;
    const formattedNum = String(nextCount).padStart(3, '0');
    const profil = this.getSekolah();
    let template = profil.formatNomorSuratKeluar || '{nomor}/SMPIT-BNY/{romawi}/{tahun}';
    template = template
      .replace('{nomor}', formattedNum)
      .replace('{romawi}', roman)
      .replace('{tahun}', String(year));

    return {
      nomorSurat: template,
      nomorAgenda: `AGK/${year}/${formattedNum}`,
    };
  },

  addSuratKeluar(data: Omit<SuratKeluar, 'id' | 'createdAt' | 'updatedAt'>): SuratKeluar {
    const list = this.getSuratKeluar();
    const now = new Date().toISOString();
    const newSurat: SuratKeluar = {
      ...data,
      id: `sk-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(newSurat);
    this.saveSuratKeluar(list);
    this.addLog(
      'CREATE_SURAT_KELUAR',
      'Surat Keluar',
      `Membuat surat keluar No: ${newSurat.nomorSurat} perihal "${newSurat.perihal}"`
    );

    // If waiting for approval, notify Kepala Sekolah
    if (newSurat.status === 'Menunggu Persetujuan') {
      const kepsek = this.getUsers().find((u) => u.role === 'kepala_sekolah');
      if (kepsek) {
        this.addNotifikasi({
          userId: kepsek.id,
          judul: 'Persetujuan Surat Keluar Diperlukan',
          pesan: `Surat keluar No. ${newSurat.nomorSurat} ("${newSurat.perihal}") menunggu persetujuan Anda.`,
          tipe: 'approval',
          tautanModul: 'surat-keluar',
          tautanId: newSurat.id,
        });
      }
    }

    return newSurat;
  },

  updateSuratKeluar(id: string, updates: Partial<SuratKeluar>): SuratKeluar | null {
    const list = this.getSuratKeluar();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveSuratKeluar(list);
    this.addLog('UPDATE_SURAT_KELUAR', 'Surat Keluar', `Memperbarui surat keluar No: ${list[idx].nomorSurat}`);
    return list[idx];
  },

  approveSuratKeluar(
    id: string,
    status: StatusSuratKeluar,
    namaPenandatangan: string,
    catatan?: string
  ): SuratKeluar | null {
    const list = this.getSuratKeluar();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    list[idx].status = status;
    list[idx].catatanPersetujuan = catatan || '';
    list[idx].disetujuiOleh = namaPenandatangan;
    list[idx].tanggalPersetujuan = new Date().toLocaleString('id-ID');
    list[idx].updatedAt = new Date().toISOString();

    this.saveSuratKeluar(list);
    this.addLog(
      status === 'Disetujui' ? 'APPROVE_SURAT_KELUAR' : 'REJECT_SURAT_KELUAR',
      'Surat Keluar',
      `Surat Keluar No: ${list[idx].nomorSurat} ${status.toLowerCase()} oleh ${namaPenandatangan}`
    );

    // Notify creator / admin
    const admin = this.getUsers().find((u) => u.role === 'admin');
    if (admin) {
      this.addNotifikasi({
        userId: admin.id,
        judul: `Surat Keluar ${status}`,
        pesan: `Surat No: ${list[idx].nomorSurat} telah ${status.toLowerCase()} oleh Kepala Sekolah: ${catatan || 'Tanpa catatan'}.`,
        tipe: 'approval',
        tautanModul: 'surat-keluar',
        tautanId: list[idx].id,
      });
    }

    return list[idx];
  },

  deleteSuratKeluar(id: string): { success: boolean; message: string } {
    let list = this.getSuratKeluar();
    const target = list.find((s) => s.id === id);
    if (!target) return { success: false, message: 'Surat keluar tidak ditemukan.' };

    list = list.filter((s) => s.id !== id);
    this.saveSuratKeluar(list);
    this.addLog('DELETE_SURAT_KELUAR', 'Surat Keluar', `Menghapus surat keluar No: ${target.nomorSurat}`);
    return { success: true, message: `Surat keluar No: ${target.nomorSurat} berhasil dihapus.` };
  },

  // Audit Logs
  getLogs(): LogAktivitas[] {
    return getLocal<LogAktivitas[]>(KEYS.LOGS, INITIAL_LOGS);
  },

  addLog(aksi: string, modul: LogAktivitas['modul'], detail: string): void {
    const logs = this.getLogs();
    const user = this.getCurrentUser();
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog: LogAktivitas = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      userId: user.id,
      userName: user.nama,
      userRole: user.role,
      aksi,
      modul,
      detail,
      ipAddress: '192.168.1.' + (10 + (user.id.charCodeAt(user.id.length - 1) % 50)),
    };
    logs.unshift(newLog);
    if (logs.length > 300) logs.pop();
    setLocal(KEYS.LOGS, logs);
  },

  // Reset to initial demo
  resetAllData(): void {
    setLocal(KEYS.USERS, INITIAL_USERS);
    setLocal(KEYS.CURRENT_USER, INITIAL_USERS[0]);
    setLocal(KEYS.SEKOLAH, INITIAL_SEKOLAH);
    setLocal(KEYS.KATEGORI, INITIAL_KATEGORI);
    setLocal(KEYS.SURAT_MASUK, INITIAL_SURAT_MASUK);
    setLocal(KEYS.SURAT_KELUAR, INITIAL_SURAT_KELUAR);
    setLocal(KEYS.DISPOSISI, INITIAL_DISPOSISI);
    setLocal(KEYS.LOGS, INITIAL_LOGS);
    setLocal(KEYS.NOTIFIKASI, INITIAL_NOTIFIKASI);
    setLocal(KEYS.PRESTASI, INITIAL_PRESTASI);
    this.addLog('RESET_DATABASE', 'Pengaturan', 'Data sistem di-reset ke kondisi awal master demo');
  },
};
