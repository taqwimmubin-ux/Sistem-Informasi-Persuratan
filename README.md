# Sistem Informasi Persuratan (E-Surat) SMPIT Bunayya

Sistem Informasi Manajemen Persuratan Terpadu untuk Sekolah Menengah Pertama Islam Terpadu (SMPIT) Bunayya. Menggantikan buku agenda manual menjadi sistem digital yang rapi, transparan, terarsip aman, dan mudah ditindaklanjuti.

---

## 1. Daftar Akun Demo

Aplikasi menyediakan 5 peran (roles) lengkap sesuai struktur organisasi sekolah:

| Peran (Role) | Username | Password Default | Nama Pengguna | Tugas & Hak Akses |
| :--- | :--- | :--- | :--- | :--- |
| **Admin / Operator TU** | `admin` | `bunayya2026` | Ustadz Muhammad Ramadhan, S.Pd., M.Pd. | CRUD surat masuk/keluar, disposisi, kelola user, master data, profil & logo sekolah, audit log, prestasi. |
| **Kepala Sekolah** | `kepsek` | `bunayya2026` | Sa'id Ramadhan, S.E., M.M., Gr., Al-Hafidz | Monitoring seluruh surat, pembuatan lembar disposisi instruksi dinas, persetujuan/penolakan surat keluar. |
| **Waka Kurikulum** | `waka_kurikulum` | `bunayya2026` | Saumiana, S.Pd., Gr. | Menerima disposisi bidang kurikulum & asesmen, update status tindak lanjut, memberikan tanggapan. |
| **Waka Kesiswaan** | `waka_kesiswaan` | `bunayya2026` | Ustadzah Nurul Hidayah, S.Pd. | Menerima disposisi kesiswaan & perlombaan, update status tindak lanjut, memberikan tanggapan. |
| **Waka Guru & Staf** | `waka_guru_staf` | `bunayya2026` | Ustadz Ridho Pratama, S.Si. | Menerima disposisi sarpras & OSIS, update status tindak lanjut, memberikan tanggapan. |

---

## 2. Cara Instalasi & Menjalankan di Komputer Lokal

### Prasyarat
- Node.js versi 18.0 atau lebih tinggi
- npm atau pnpm / yarn
- Git

### Langkah Instalasi
```bash
# 1. Clone repositori dari GitHub / Git lokal
git clone https://github.com/smpitbunayya/e-surat-bunayya.git

# 2. Masuk ke direktori proyek
cd e-surat-bunayya

# 3. Pasang semua dependensi
npm install

# 4. Jalankan development server
npm run dev
```

Buka peramban (browser) di alamat: **`http://localhost:3000`**.

### Build untuk Produksi
```bash
npm run build
npm run preview
```

---

## 3. Panduan Deploy ke Hosting

### A. Deploy ke Vercel / Netlify (Serverless / Static SPA)
1. Buat repositori baru di GitHub / GitLab dan push seluruh kode proyek.
2. Buka dashboard [Vercel](https://vercel.com/) atau [Netlify](https://netlify.com/).
3. Hubungkan repositori GitHub Anda.
4. Pengaturan Build:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Klik **Deploy**. Aplikasi akan otomatis aktif dengan sertifikat SSL gratis (HTTPS).

### B. Deploy ke VPS Linux (Ubuntu 22.04 / 24.04 LTS + Nginx)
1. Masuk ke server VPS via SSH:
   ```bash
   ssh root@ip-server-anda
   ```
2. Install Node.js & Nginx:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx git
   ```
3. Clone proyek ke `/var/www/esurat`:
   ```bash
   git clone https://github.com/smpitbunayya/e-surat-bunayya.git /var/www/esurat
   cd /var/www/esurat && npm install && npm run build
   ```
4. Konfigurasikan Server Block Nginx (`/etc/nginx/sites-available/esurat`):
   ```nginx
   server {
       listen 80;
       server_name persuratan.smpitbunayya.sch.id;
       root /var/www/esurat/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
5. Aktifkan situs dan pasang sertifikat SSL:
   ```bash
   sudo ln -s /etc/nginx/sites-available/esurat /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d persuratan.smpitbunayya.sch.id
   ```

---

## 4. Skema Database / ERD & DDL SQL

Jika sistem ini dihubungkan dengan basis data PostgreSQL atau MySQL, berikut adalah DDL skema relasionalnya:

```sql
-- 1. TABEL ROLES
CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- 'admin', 'kepala_sekolah', 'waka_kurikulum', 'waka_kesiswaan', 'waka_guru_staf'
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABEL USERS
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nama VARCHAR(150) NOT NULL,
  nip VARCHAR(50),
  jabatan VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  telepon VARCHAR(25),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABEL KATEGORI_SURAT
CREATE TABLE kategori_surat (
  id VARCHAR(36) PRIMARY KEY,
  kode VARCHAR(10) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABEL SURAT_MASUK
CREATE TABLE surat_masuk (
  id VARCHAR(36) PRIMARY KEY,
  nomor_agenda VARCHAR(50) NOT NULL UNIQUE,
  nomor_surat VARCHAR(100) NOT NULL,
  tanggal_surat DATE NOT NULL,
  tanggal_diterima DATE NOT NULL,
  pengirim VARCHAR(200) NOT NULL,
  alamat_pengirim TEXT,
  perihal VARCHAR(255) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  sifat VARCHAR(20) NOT NULL DEFAULT 'Biasa',
  ringkasan TEXT,
  status_disposisi VARCHAR(30) DEFAULT 'Belum Didisposisi',
  created_by VARCHAR(36) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABEL DISPOSISI
CREATE TABLE disposisi (
  id VARCHAR(36) PRIMARY KEY,
  surat_masuk_id VARCHAR(36) NOT NULL REFERENCES surat_masuk(id) ON DELETE CASCADE,
  pemberi_id VARCHAR(36) NOT NULL REFERENCES users(id),
  tanggal_disposisi DATE NOT NULL,
  batas_waktu DATE NOT NULL,
  prioritas VARCHAR(20) NOT NULL DEFAULT 'Biasa',
  catatan_khusus TEXT,
  status_global VARCHAR(20) DEFAULT 'Baru',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABEL DISPOSISI_TUJUAN
CREATE TABLE disposisi_tujuan (
  id VARCHAR(36) PRIMARY KEY,
  disposisi_id VARCHAR(36) NOT NULL REFERENCES disposisi(id) ON DELETE CASCADE,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'Baru', -- 'Baru', 'Dibaca', 'Diproses', 'Selesai'
  tanggapan TEXT,
  tanggal_dibaca TIMESTAMP,
  tanggal_selesai TIMESTAMP
);

-- 7. TABEL SURAT_KELUAR
CREATE TABLE surat_keluar (
  id VARCHAR(36) PRIMARY KEY,
  nomor_agenda VARCHAR(50) NOT NULL UNIQUE,
  nomor_surat VARCHAR(100) NOT NULL UNIQUE,
  tanggal_surat DATE NOT NULL,
  tujuan VARCHAR(200) NOT NULL,
  alamat_tujuan TEXT,
  perihal VARCHAR(255) NOT NULL,
  kategori VARCHAR(100) NOT NULL,
  sifat VARCHAR(20) NOT NULL DEFAULT 'Biasa',
  ringkasan TEXT,
  isi_surat TEXT,
  penandatangan_nama VARCHAR(150) NOT NULL,
  penandatangan_jabatan VARCHAR(100) NOT NULL,
  penandatangan_nip VARCHAR(50),
  status VARCHAR(30) DEFAULT 'Draft',
  catatan_persetujuan TEXT,
  disetujui_oleh VARCHAR(150),
  tanggal_persetujuan TIMESTAMP,
  created_by VARCHAR(36) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABEL PRESTASI
CREATE TABLE prestasi (
  id VARCHAR(36) PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  tingkat VARCHAR(50) NOT NULL,
  nama_siswa VARCHAR(200) NOT NULL,
  peringkat VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  deskripsi TEXT,
  foto_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABEL LOG_AKTIVITAS (Audit Trail)
CREATE TABLE log_aktivitas (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id),
  user_name VARCHAR(150) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  aksi VARCHAR(50) NOT NULL,
  modul VARCHAR(50) NOT NULL,
  detail TEXT NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Saran Pengembangan Lanjutan

1. **Integrasi WhatsApp Gateway (Wablas / Fonnte / Twilio)**:
   Notifikasi otomatis secara langsung ke nomor HP penerima begitu lembar disposisi baru diterbitkan oleh Kepala Sekolah.
2. **Sertifikat Elektronik Tanda Tangan BSrE (Badan Siber dan Sandi Negara)**:
   Penerapan tanda tangan digital berkekuatan hukum tetap (*cryptographic digital signature*) berstandar instansi pemerintah.
3. **Public QR Code Validation URL**:
   Halaman verifikasi publik untuk memvalidasi keabsahan dokumen surat dinas saat dipindai oleh pihak eksternal.
