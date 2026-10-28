export type UserRole =
  | 'admin'
  | 'kepala_sekolah'
  | 'waka_kurikulum'
  | 'waka_kesiswaan'
  | 'waka_guru_staf';

export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export interface User {
  id: string;
  username: string;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  mustChangePassword?: boolean;
  nama: string;
  jenisKelamin: JenisKelamin;
  nip?: string;
  jabatan: string;
  role: UserRole;
  email: string;
  telepon: string;
  avatar?: string;
  aktif: boolean;
}

export type SifatSurat = 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';

export type StatusDisposisi = 'Baru' | 'Dibaca' | 'Diproses' | 'Selesai';

export type StatusSuratKeluar = 'Draft' | 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Terkirim';

export interface DisposisiTujuan {
  userId: string;
  nama: string;
  jabatan: string;
  status: StatusDisposisi;
  tanggapan?: string;
  tanggalDibaca?: string;
  tanggalSelesai?: string;
}

export interface Disposisi {
  id: string;
  suratMasukId: string;
  nomorSurat: string;
  perihal: string;
  pemberiDisposisiId: string;
  pemberiDisposisiNama: string;
  tanggalDisposisi: string;
  batasWaktu: string;
  prioritas: 'Biasa' | 'Segera' | 'Sangat Segera';
  instruksi: string[]; // e.g. ["Tindak lanjuti", "Koordinasikan", "Hadiri/Wakilkan"]
  catatanKhusus?: string;
  tujuan: DisposisiTujuan[];
  statusGlobal: StatusDisposisi;
}

export interface LampiranFile {
  id: string;
  namaFile: string;
  ukuran: string;
  tipe: 'pdf' | 'image' | 'doc';
  dataUrl?: string; // base64 or preview
}

export interface SuratMasuk {
  id: string;
  nomorAgenda: string; // e.g. AGM/2026/001
  nomorSurat: string; // original letter number
  tanggalSurat: string; // YYYY-MM-DD
  tanggalDiterima: string; // YYYY-MM-DD
  pengirim: string; // e.g. Dinas Pendidikan Kota
  alamatPengirim?: string;
  perihal: string;
  kategori: string; // Undangan, Pemberitahuan, dll.
  sifat: SifatSurat;
  ringkasan: string;
  lampiran: LampiranFile[];
  statusDisposisi: 'Belum Didisposisi' | 'Sudah Didisposisi' | 'Selesai';
  idDisposisiTerakhir?: string;
  dibuatOleh: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuratKeluar {
  id: string;
  nomorSurat: string; // e.g. 042/SMPIT-BNY/X/2026
  nomorAgenda: string;
  tanggalSurat: string;
  tujuan: string; // Penerima / Instansi
  alamatTujuan?: string;
  perihal: string;
  kategori: string;
  sifat: SifatSurat;
  ringkasan: string;
  isiSurat?: string; // Teks lengkap untuk template cetak resmi
  penandatanganNama: string;
  penandatanganJabatan: string;
  penandatanganNip?: string;
  status: StatusSuratKeluar;
  catatanPersetujuan?: string;
  disetujuiOleh?: string;
  tanggalPersetujuan?: string;
  lampiran: LampiranFile[];
  dibuatOleh: string;
  createdAt: string;
  updatedAt: string;
}

export interface KategoriSurat {
  id: string;
  kode: string;
  nama: string;
  keterangan?: string;
  warnaBadge?: string;
}

export interface LogAktivitas {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  aksi: string;
  modul:
    | 'Surat Masuk'
    | 'Surat Keluar'
    | 'Disposisi'
    | 'Auth'
    | 'Master Data'
    | 'Pengaturan'
    | 'Laporan'
    | 'Pengguna'
    | 'Prestasi'
    | 'Notifikasi';
  detail: string;
  ipAddress: string;
}

export interface Notifikasi {
  id: string;
  userId: string; // recipient user id or 'ALL'
  judul: string;
  pesan: string;
  tipe: 'disposisi' | 'surat_masuk' | 'surat_keluar' | 'approval' | 'sistem';
  tautanModul: 'surat-masuk' | 'surat-keluar' | 'disposisi-saya' | 'profil-sekolah';
  tautanId?: string;
  dibaca: boolean;
  createdAt: string;
}

export type KategoriPrestasi =
  | 'Akademik'
  | 'Non-Akademik'
  | 'Keagamaan'
  | 'Olahraga'
  | 'Seni';

export type TingkatPrestasi =
  | 'Sekolah'
  | 'Kecamatan'
  | 'Kota/Kabupaten'
  | 'Kabupaten/Kota'
  | 'Provinsi'
  | 'Nasional'
  | 'Internasional';

export interface Prestasi {
  id: string;
  judul: string;
  kategori: KategoriPrestasi;
  tingkat: TingkatPrestasi;
  namaSiswa: string;
  peringkat: string; // Juara 1, Medali Emas, dll.
  tanggal: string;
  deskripsi: string;
  fotoUrl?: string; // base64 or link
  dokumenLampiran?: LampiranFile[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfilSekolah {
  namaSekolah: string;
  yayasan: string;
  npsn: string;
  nss: string;
  akreditasi: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kotaKabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  formatNomorSuratKeluar: string; // e.g. "{nomor}/SMPIT-BNY/{romawi}/{tahun}"
  teksKopSurat?: string; // Teks tambahan kop resmi
  logoUrl?: string; // custom logo base64 or svg
  sejarah?: string;
  visi?: string;
  misi?: string[];
  fotoGedungUrl?: string;
  temaWarna?: string;
}
