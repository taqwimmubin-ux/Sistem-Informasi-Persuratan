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
    const user = getLocal<User | null>(KEYS.CURRENT_USER, null);
    if (user) return user;
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
    return getLocal<User[]>(KEYS.USERS, INITIAL_USERS);
  },

  saveUsers(users: User[]): void {
    setLocal(KEYS.USERS, users);
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },

  addUser(newUser: Omit<User, 'id'>): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    // Validate unique username
    if (users.some((u) => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      return { success: false, message: 'Username sudah digunakan oleh akun lain.' };
    }
    // Validate password
    if (newUser.password && newUser.password.length < 8) {
      return { success: false, message: 'Kata sandi minimal harus 8 karakter.' };
    }

    const created: User = {
      ...newUser,
      id: `usr-${Date.now()}`,
      password: newUser.password || 'bunayya2026',
    };
    users.push(created);
    this.saveUsers(users);
    this.addLog('CREATE_USER', 'Pengguna', `Menambahkan pengguna baru: ${created.nama} (${created.jabatan})`);
    return { success: true, message: 'Pengguna baru berhasil ditambahkan.', user: created };
  },

  updateUser(id: string, updates: Partial<User>): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return { success: false, message: 'Pengguna tidak ditemukan.' };

    if (updates.username && updates.username.toLowerCase() !== users[idx].username.toLowerCase()) {
      if (users.some((u) => u.id !== id && u.username.toLowerCase() === updates.username?.toLowerCase())) {
        return { success: false, message: 'Username baru sudah digunakan oleh pengguna lain.' };
      }
    }

    if (updates.password && updates.password.length < 8) {
      return { success: false, message: 'Kata sandi minimal 8 karakter.' };
    }

    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);

    const currentUser = this.getCurrentUser();
    if (currentUser.id === id) {
      setLocal(KEYS.CURRENT_USER, users[idx]);
    }

    this.addLog('UPDATE_USER', 'Pengguna', `Memperbarui data pengguna: ${users[idx].nama}`);
    return { success: true, message: 'Data pengguna berhasil diperbarui.', user: users[idx] };
  },

  deleteUser(id: string): { success: boolean; message: string } {
    const currentUser = this.getCurrentUser();
    if (currentUser.id === id) {
      return { success: false, message: 'Tidak dapat menghapus akun yang sedang Anda gunakan.' };
    }

    let users = this.getUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, message: 'Pengguna tidak ditemukan.' };

    users = users.filter((u) => u.id !== id);
    this.saveUsers(users);
    this.addLog('DELETE_USER', 'Pengguna', `Menghapus akun pengguna: ${target.nama} (@${target.username})`);
    return { success: true, message: `Akun ${target.nama} berhasil dihapus.` };
  },

  resetUserPassword(id: string, newPass = 'bunayya2026'): { success: boolean; message: string } {
    const res = this.updateUser(id, { password: newPass });
    if (res.success) {
      this.addLog('RESET_PASSWORD', 'Pengguna', `Mereset kata sandi akun ID: ${id}`);
    }
    return { success: res.success, message: res.success ? `Password berhasil direset ke: ${newPass}` : res.message };
  },

  // School Profile & Branding
  getSekolah(): ProfilSekolah {
    const cached = getLocal<ProfilSekolah>(KEYS.SEKOLAH, INITIAL_SEKOLAH);
    return cached;
  },

  async loadSekolahAsync(): Promise<ProfilSekolah> {
    const cached = this.getSekolah();
    try {
      // Check if there is an indexedDB stored high-res logo
      const idbLogo = await IndexedDBStorage.getItem('school_logo_base64');
      if (idbLogo && idbLogo !== cached.logoUrl) {
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
