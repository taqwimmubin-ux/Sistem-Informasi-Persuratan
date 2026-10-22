import React, { useState, useMemo, useRef } from 'react';
import {
  Trophy,
  Building2,
  Search,
  Plus,
  Filter,
  Calendar,
  Medal,
  Award,
  Eye,
  Edit,
  Trash2,
  X,
  Upload,
  Check,
  FileText,
  MapPin,
  Phone,
  Mail,
  Globe,
  Sparkles,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { Prestasi, ProfilSekolah, User, KategoriPrestasi, TingkatPrestasi, LampiranFile } from '../../types';
import { StorageService } from '../../services/storage';
import { compressAndValidateLogo } from '../../services/imageCompression';

interface ProfilPrestasiViewProps {
  prestasiList: Prestasi[];
  sekolah: ProfilSekolah;
  currentUser: User;
  onRefresh: () => void;
  onNavigateToSettings: () => void;
}

// Normalizer agar 'Kabupaten/Kota' dan 'Kota/Kabupaten' cocok secara konsisten
export function normalizeTingkat(tingkatStr?: string): string {
  if (!tingkatStr) return '';
  const clean = tingkatStr.trim().toLowerCase();
  if (clean === 'kota/kabupaten' || clean === 'kabupaten/kota' || clean === 'kabupaten' || clean === 'kota') {
    return 'kabupaten/kota';
  }
  return clean;
}

export const ProfilPrestasiView: React.FC<ProfilPrestasiViewProps> = ({
  prestasiList,
  sekolah,
  currentUser,
  onRefresh,
  onNavigateToSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'prestasi' | 'profil'>('prestasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [selectedTingkat, setSelectedTingkat] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  // Detail Modal Prestasi
  const [selectedPrestasiDetail, setSelectedPrestasiDetail] = useState<Prestasi | null>(null);

  // Form Modal Prestasi (Add / Edit)
  const [showPrestasiModal, setShowPrestasiModal] = useState(false);
  const [editingPrestasi, setEditingPrestasi] = useState<Prestasi | null>(null);

  // Form Fields Prestasi
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<KategoriPrestasi>('Keagamaan');
  const [tingkat, setTingkat] = useState<TingkatPrestasi>('Provinsi');
  const [namaSiswa, setNamaSiswa] = useState('');
  const [peringkat, setPeringkat] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [dokumenLampiran, setDokumenLampiran] = useState<LampiranFile[]>([]);
  const [isCompressingPrestasiFoto, setIsCompressingPrestasiFoto] = useState(false);

  // --- MODAL EDIT PROFIL & VISI MISI (MASALAH 2) ---
  const [isEditProfilOpen, setIsEditProfilOpen] = useState(false);
  const [editSejarah, setEditSejarah] = useState(sekolah.sejarah || '');
  const [editVisi, setEditVisi] = useState(sekolah.visi || '');
  const [editMisiList, setEditMisiList] = useState<string[]>(sekolah.misi || []);
  const [newMisiInput, setNewMisiInput] = useState('');
  const [editAlamat, setEditAlamat] = useState(sekolah.alamat || '');
  const [editKecamatan, setEditKecamatan] = useState(sekolah.kecamatan || '');
  const [editKota, setEditKota] = useState(sekolah.kotaKabupaten || '');
  const [editTelepon, setEditTelepon] = useState(sekolah.telepon || '');
  const [editEmail, setEditEmail] = useState(sekolah.email || '');
  const [editWebsite, setEditWebsite] = useState(sekolah.website || '');
  const [editFotoGedung, setEditFotoGedung] = useState(sekolah.fotoGedungUrl || '');
  const [isCompressingGedung, setIsCompressingGedung] = useState(false);
  const [profilSaveSuccess, setProfilSaveSuccess] = useState<string | null>(null);
  const [profilErrorMsg, setProfilErrorMsg] = useState<string | null>(null);

  // Alert Feedback
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showActionSuccess = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  // Filtered Prestasi with robust normalizer for ALL levels
  const filteredPrestasi = useMemo(() => {
    return prestasiList.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchQ =
        !searchQuery ||
        p.judul.toLowerCase().includes(q) ||
        p.namaSiswa.toLowerCase().includes(q) ||
        p.peringkat.toLowerCase().includes(q) ||
        p.deskripsi.toLowerCase().includes(q);

      const matchKat = selectedKategori === 'ALL' || p.kategori === selectedKategori;
      const matchTingkat =
        selectedTingkat === 'ALL' ||
        normalizeTingkat(p.tingkat) === normalizeTingkat(selectedTingkat);
      const matchYear = selectedYear === 'ALL' || (p.tanggal && p.tanggal.startsWith(selectedYear));

      return matchQ && matchKat && matchTingkat && matchYear;
    });
  }, [prestasiList, searchQuery, selectedKategori, selectedTingkat, selectedYear]);

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    prestasiList.forEach((p) => {
      if (p.tanggal) years.add(p.tanggal.substring(0, 4));
    });
    return Array.from(years).sort().reverse();
  }, [prestasiList]);

  // --- PRESTASI ACTIONS (ADD / EDIT / DELETE) ---
  const openAddPrestasiModal = () => {
    setEditingPrestasi(null);
    setJudul('');
    setKategori('Keagamaan');
    setTingkat('Provinsi');
    setNamaSiswa('');
    setPeringkat('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setDeskripsi('');
    setFotoUrl('');
    setDokumenLampiran([]);
    setShowPrestasiModal(true);
  };

  const openEditPrestasiModal = (p: Prestasi, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPrestasi(p);
    setJudul(p.judul);
    setKategori(p.kategori);
    setTingkat(p.tingkat);
    setNamaSiswa(p.namaSiswa);
    setPeringkat(p.peringkat);
    setTanggal(p.tanggal);
    setDeskripsi(p.deskripsi);
    setFotoUrl(p.fotoUrl || '');
    setDokumenLampiran(p.dokumenLampiran || []);
    setShowPrestasiModal(true);
  };

  // Aksi Hapus Prestasi (MASALAH 3) - Berfungsi untuk SEMUA tingkat prestasi berdasarkan ID unik
  const handleDeletePrestasi = (p: Prestasi, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const confirmed = confirm(
      `Yakin ingin menghapus prestasi "${p.judul}"?\nFoto/dokumen terkait juga akan terhapus.`
    );

    if (confirmed) {
      const res = StorageService.deletePrestasi(p.id);
      if (selectedPrestasiDetail?.id === p.id) {
        setSelectedPrestasiDetail(null);
      }
      onRefresh();
      showActionSuccess(res.message);
    }
  };

  const handlePrestasiPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingPrestasiFoto(true);
    try {
      const res = await compressAndValidateLogo(file, 800);
      if (res.success && res.base64) {
        setFotoUrl(res.base64);
      } else {
        alert(res.message || 'Gagal memproses foto.');
      }
    } catch {
      alert('Gagal mengunggah foto prestasi.');
    } finally {
      setIsCompressingPrestasiFoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handlePrestasiDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const tipe: 'pdf' | 'image' | 'doc' =
      ext === 'pdf' ? 'pdf' : ['jpg', 'jpeg', 'png'].includes(ext || '') ? 'image' : 'doc';

    const newDoc: LampiranFile = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      namaFile: file.name,
      ukuran: `${(file.size / 1024).toFixed(0)} KB`,
      tipe,
    };
    setDokumenLampiran((prev) => [...prev, newDoc]);
    if (e.target) e.target.value = '';
  };

  const handlePrestasiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !namaSiswa.trim() || !peringkat.trim()) {
      alert('Mohon lengkapi judul prestasi, nama siswa, dan peringkat.');
      return;
    }

    if (editingPrestasi) {
      StorageService.updatePrestasi(editingPrestasi.id, {
        judul: judul.trim(),
        kategori,
        tingkat,
        namaSiswa: namaSiswa.trim(),
        peringkat: peringkat.trim(),
        tanggal,
        deskripsi: deskripsi.trim(),
        fotoUrl,
        dokumenLampiran,
      });
      showActionSuccess(`Prestasi "${judul.trim()}" berhasil diperbarui.`);
    } else {
      StorageService.addPrestasi({
        judul: judul.trim(),
        kategori,
        tingkat,
        namaSiswa: namaSiswa.trim(),
        peringkat: peringkat.trim(),
        tanggal,
        deskripsi: deskripsi.trim(),
        fotoUrl:
          fotoUrl ||
          'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&auto=format&fit=crop&q=80',
        dokumenLampiran,
      });
      showActionSuccess(`Prestasi baru "${judul.trim()}" berhasil ditambahkan.`);
    }

    setShowPrestasiModal(false);
    onRefresh();
  };

  // Badge Tingkat Prestasi untuk SEMUA tingkat
  const getTingkatBadge = (tingkatVal: TingkatPrestasi | string) => {
    const norm = normalizeTingkat(tingkatVal);
    switch (norm) {
      case 'internasional':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
            Internasional
          </span>
        );
      case 'nasional':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            Nasional
          </span>
        );
      case 'provinsi':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            Provinsi
          </span>
        );
      case 'kabupaten/kota':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            Kabupaten/Kota
          </span>
        );
      case 'kecamatan':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            Kecamatan
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            Sekolah
          </span>
        );
    }
  };

  // --- PROFIL SEKOLAH, VISI, DAN MISI (MASALAH 2) ---
  const openEditProfilModal = () => {
    setEditSejarah(sekolah.sejarah || '');
    setEditVisi(sekolah.visi || '');
    setEditMisiList(sekolah.misi && sekolah.misi.length > 0 ? [...sekolah.misi] : ['']);
    setNewMisiInput('');
    setEditAlamat(sekolah.alamat || '');
    setEditKecamatan(sekolah.kecamatan || '');
    setEditKota(sekolah.kotaKabupaten || '');
    setEditTelepon(sekolah.telepon || '');
    setEditEmail(sekolah.email || '');
    setEditWebsite(sekolah.website || '');
    setEditFotoGedung(sekolah.fotoGedungUrl || '');
    setProfilErrorMsg(null);
    setProfilSaveSuccess(null);
    setIsEditProfilOpen(true);
  };

  const handleAddMisiItem = () => {
    if (!newMisiInput.trim()) return;
    setEditMisiList((prev) => [...prev, newMisiInput.trim()]);
    setNewMisiInput('');
  };

  const handleRemoveMisiItem = (idx: number) => {
    setEditMisiList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveMisiItem = (idx: number, direction: 'up' | 'down') => {
    setEditMisiList((prev) => {
      const copy = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= copy.length) return prev;
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleFotoGedungUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCompressingGedung(true);
    try {
      const res = await compressAndValidateLogo(file, 900);
      if (res.success && res.base64) {
        setEditFotoGedung(res.base64);
      } else {
        alert(res.message || 'Gagal memproses foto sekolah.');
      }
    } catch {
      alert('Gagal mengunggah foto sekolah.');
    } finally {
      setIsCompressingGedung(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveProfilVisiMisi = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfilErrorMsg(null);

    // Validasi Visi dan Misi tidak boleh kosong
    if (!editVisi.trim()) {
      setProfilErrorMsg('Visi sekolah tidak boleh kosong.');
      return;
    }

    const validMisi = editMisiList.map((m) => m.trim()).filter(Boolean);
    if (newMisiInput.trim()) {
      validMisi.push(newMisiInput.trim());
    }

    if (validMisi.length === 0) {
      setProfilErrorMsg('Misi sekolah minimal harus memiliki 1 butir poin.');
      return;
    }

    const updatedProfil: ProfilSekolah = {
      ...sekolah,
      sejarah: editSejarah.trim(),
      visi: editVisi.trim(),
      misi: validMisi,
      alamat: editAlamat.trim(),
      kecamatan: editKecamatan.trim(),
      kotaKabupaten: editKota.trim(),
      telepon: editTelepon.trim(),
      email: editEmail.trim(),
      website: editWebsite.trim(),
      fotoGedungUrl: editFotoGedung,
    };

    const res = await StorageService.saveSekolahWithLogo(updatedProfil);
    if (!res.success) {
      setProfilErrorMsg(res.message);
      return;
    }

    setProfilSaveSuccess('Profil, visi, dan misi sekolah berhasil diperbarui secara permanen!');
    setTimeout(() => {
      setIsEditProfilOpen(false);
      setProfilSaveSuccess(null);
    }, 1200);

    onRefresh();
    showActionSuccess('Profil sekolah dan visi-misi berhasil diperbarui.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Feedback */}
      {actionSuccessMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 border border-emerald-500">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            Profil Sekolah & Prestasi Siswa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Etalase capaian kejuaraan santri, sejarah institusi, serta visi misi SMPIT Bunayya
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('prestasi')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'prestasi'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Galeri Prestasi ({prestasiList.length})
            </button>
            <button
              onClick={() => setActiveTab('profil')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'profil'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Profil & Visi Misi
            </button>
          </div>

          {activeTab === 'prestasi' && currentUser.role === 'admin' && (
            <button
              onClick={openAddPrestasiModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Plus className="w-4 h-4" />
              Tambah Prestasi
            </button>
          )}

          {activeTab === 'profil' && currentUser.role === 'admin' && (
            <button
              onClick={openEditProfilModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Edit Profil & Visi Misi
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: PRESTASI SISWA */}
      {activeTab === 'prestasi' && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari prestasi, nama santri, cabang lomba..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto flex-1">
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Keagamaan">Keagamaan / Tahfidz</option>
                <option value="Akademik">Akademik / Sains</option>
                <option value="Olahraga">Olahraga</option>
                <option value="Seni">Seni Islami</option>
                <option value="Non-Akademik">Non-Akademik Lainnya</option>
              </select>

              <select
                value={selectedTingkat}
                onChange={(e) => setSelectedTingkat(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">Semua Tingkat</option>
                <option value="Internasional">Tingkat Internasional</option>
                <option value="Nasional">Tingkat Nasional</option>
                <option value="Provinsi">Tingkat Provinsi</option>
                <option value="Kabupaten/Kota">Tingkat Kabupaten/Kota</option>
                <option value="Kecamatan">Tingkat Kecamatan</option>
                <option value="Sekolah">Tingkat Sekolah</option>
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">Semua Tahun</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrestasi.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400">
                <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Belum ada data prestasi yang cocok</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Coba sesuaikan kata kunci pencarian atau bersihkan filter tingkat/kategori.
                </p>
              </div>
            ) : (
              filteredPrestasi.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPrestasiDetail(p)}
                  className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Photo Header */}
                    <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={p.fotoUrl || 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&auto=format&fit=crop&q=80'}
                        alt={p.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 shadow-md">
                          {p.peringkat}
                        </span>
                        {getTingkatBadge(p.tingkat)}
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded text-[10px] font-medium">
                        {p.tanggal}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: 'var(--theme-primary)' }}
                      >
                        {p.kategori}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {p.judul}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{p.namaSiswa}</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {p.deskripsi}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3.5 bg-slate-50/70 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span
                      className="font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      Lihat Rincian <ExternalLink className="w-3.5 h-3.5" />
                    </span>

                    {currentUser.role === 'admin' && (
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => openEditPrestasiModal(p, e)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Edit Prestasi"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePrestasi(p, e)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title={`Hapus Prestasi (${p.tingkat})`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROFIL SEKOLAH */}
      {activeTab === 'profil' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div
            className="relative rounded-3xl overflow-hidden text-white p-8 sm:p-12 shadow-xl"
            style={{
              background:
                'linear-gradient(135deg, var(--theme-sidebar-mid, #064e3b) 0%, var(--theme-sidebar-end, #022c22) 100%)',
            }}
          >
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 font-semibold text-xs border border-white/10">
                Profil Resmi Lembaga
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {sekolah.namaSekolah}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                Di bawah naungan <strong>{sekolah.yayasan}</strong>. Terakreditasi <strong>{sekolah.akreditasi}</strong>.
              </p>

              {currentUser.role === 'admin' && (
                <div className="pt-2 flex flex-wrap gap-2.5">
                  <button
                    onClick={openEditProfilModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profil, Visi & Misi Sekolah
                  </button>
                  <button
                    onClick={onNavigateToSettings}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all border border-white/20 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    Pengaturan Logo & Kop Surat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Visi, Misi & Sejarah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visi & Misi */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 shadow-xs">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider block"
                    style={{ color: 'var(--theme-primary)' }}
                  >
                    Arah Perjuangan Pendidikan
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    Visi Sekolah
                  </h3>
                  <p
                    className="mt-2 text-xs italic font-serif leading-relaxed p-3.5 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--theme-primary-light)',
                      borderColor: 'rgba(var(--theme-primary-rgb, 5, 150, 105), 0.25)',
                      color: 'var(--theme-primary-dark)',
                    }}
                  >
                    "{sekolah.visi}"
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2.5">
                  Misi Utama Lembaga
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {sekolah.misi && sekolah.misi.length > 0 ? (
                    sekolah.misi.map((m, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 text-white"
                          style={{ backgroundColor: 'var(--theme-primary)' }}
                        >
                          {idx + 1}
                        </span>
                        <span>{m}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400 italic">Belum ada butir misi yang diisi.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Sejarah & Kontak */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs flex flex-col justify-between">
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  Napak Tilas & Karakter
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Sejarah Singkat Lembaga
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
                  {sekolah.sejarah || 'Sejarah institusi belum diisi.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">Alamat & Sekretariat:</h4>
                <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
                  <span>
                    {sekolah.alamat}, Kec. {sekolah.kecamatan}, {sekolah.kotaKabupaten}, {sekolah.provinsi} {sekolah.kodePos}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span>{sekolah.telepon}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span>{sekolah.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Globe className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                  <span>{sekolah.website}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL PRESTASI (DILENGKAPI TOMBOL EDIT & HAPUS UNTUK ADMIN) */}
      {selectedPrestasiDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="relative h-56 bg-slate-900">
              <img
                src={selectedPrestasiDetail.fotoUrl}
                alt={selectedPrestasiDetail.judul}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedPrestasiDetail(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900 shadow">
                  {selectedPrestasiDetail.peringkat}
                </span>
                {getTingkatBadge(selectedPrestasiDetail.tingkat)}
              </div>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider block"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  {selectedPrestasiDetail.kategori} • Tanggal: {selectedPrestasiDetail.tanggal}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedPrestasiDetail.judul}
                </h3>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Pemenang: {selectedPrestasiDetail.namaSiswa}</span>
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedPrestasiDetail.deskripsi}
              </div>

              {/* Lampiran Sertifikat */}
              {selectedPrestasiDetail.dokumenLampiran && selectedPrestasiDetail.dokumenLampiran.length > 0 && (
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Berkas Sertifikat / Dokumen Terlampir:
                  </span>
                  <div className="space-y-1.5">
                    {selectedPrestasiDetail.dokumenLampiran.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-2.5 rounded-xl border flex items-center justify-between text-xs"
                        style={{
                          backgroundColor: 'var(--theme-primary-light)',
                          borderColor: 'rgba(var(--theme-primary-rgb, 5, 150, 105), 0.25)',
                          color: 'var(--theme-primary-dark)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">{doc.namaFile}</span>
                        </div>
                        <span className="text-[10px] opacity-75">{doc.ukuran}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {currentUser.role === 'admin' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedPrestasiDetail;
                        setSelectedPrestasiDetail(null);
                        openEditPrestasiModal(target);
                      }}
                      className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Prestasi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePrestasi(selectedPrestasiDetail)}
                      className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}

                <button
                  onClick={() => setSelectedPrestasiDetail(null)}
                  className="px-4 py-2 text-white font-bold rounded-xl cursor-pointer"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORM PRESTASI (ADD / EDIT) */}
      {showPrestasiModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div
              className="px-6 py-4 text-white flex items-center justify-between"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <h3 className="font-bold text-sm">
                {editingPrestasi ? 'Edit Data Prestasi' : 'Tambah Prestasi Baru'}
              </h3>
              <button
                onClick={() => setShowPrestasiModal(false)}
                className="text-white hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePrestasiSubmit} className="p-6 space-y-3.5 text-xs max-h-[82vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Prestasi / Judul Kejuaraan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Juara 1 MHQ 5 Juz Tingkat Provinsi Jawa Barat"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Bidang
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriPrestasi)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none bg-white dark:bg-slate-800"
                  >
                    <option value="Keagamaan">Keagamaan / Tahfidz</option>
                    <option value="Akademik">Akademik / Sains</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Seni">Seni Islami</option>
                    <option value="Non-Akademik">Non-Akademik Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat Kejuaraan
                  </label>
                  <select
                    value={tingkat}
                    onChange={(e) => setTingkat(e.target.value as TingkatPrestasi)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none bg-white dark:bg-slate-800"
                  >
                    <option value="Sekolah">Tingkat Sekolah</option>
                    <option value="Kecamatan">Tingkat Kecamatan</option>
                    <option value="Kabupaten/Kota">Tingkat Kabupaten/Kota</option>
                    <option value="Provinsi">Tingkat Provinsi</option>
                    <option value="Nasional">Tingkat Nasional</option>
                    <option value="Internasional">Tingkat Internasional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Siswa / Tim Santri *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Fatih Al-Ghazali (IX-A)"
                    value={namaSiswa}
                    onChange={(e) => setNamaSiswa(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Peringkat / Capaian *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Juara 1 (Medali Emas)"
                    value={peringkat}
                    onChange={(e) => setPeringkat(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Penghargaan / Kejuaraan
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Singkat Kejuaraan
                </label>
                <textarea
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Ceritakan proses seleksi, jumlah peserta, atau nilai yang diraih..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none resize-none"
                />
              </div>

              {/* Foto Dokumentasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Foto Dokumentasi / Penyerahan Piala</span>
                  {isCompressingPrestasiFoto && (
                    <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Mengompresi...
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePrestasiPhotoUpload}
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 cursor-pointer"
                />
                {fotoUrl && (
                  <div className="mt-2 w-24 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Upload Dokumen Piagam / Sertifikat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unggah Dokumen Sertifikat / Piagam (PDF / JPG)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handlePrestasiDocUpload}
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 cursor-pointer"
                />

                {dokumenLampiran.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {dokumenLampiran.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px]"
                      >
                        <span className="truncate">{doc.namaFile}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setDokumenLampiran((prev) => prev.filter((d) => d.id !== doc.id))
                          }
                          className="text-rose-600 hover:text-rose-800 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrestasiModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Check className="w-4 h-4" />
                  {editingPrestasi ? 'Simpan Perubahan' : 'Terbitkan Prestasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PROFIL SEKOLAH, VISI & MISI (MASALAH 2) */}
      {isEditProfilOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div
              className="px-6 py-4 text-white flex items-center justify-between"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Edit Profil, Visi, Misi & Gedung Sekolah</h3>
              </div>
              <button
                onClick={() => setIsEditProfilOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfilVisiMisi} className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
              {profilSaveSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profilSaveSuccess}</span>
                </div>
              )}

              {profilErrorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 rounded-xl flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{profilErrorMsg}</span>
                </div>
              )}

              {/* Visi Sekolah */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Visi Sekolah *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editVisi}
                  onChange={(e) => setEditVisi(e.target.value)}
                  placeholder="Tuliskan rumusan visi sekolah..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              {/* Misi Sekolah (Daftar Poin Dinamis) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Misi Utama Sekolah (Daftar Butir Poin) *
                </label>

                <div className="space-y-2">
                  {editMisiList.map((misiItem, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-lg text-white font-bold flex items-center justify-center text-[10px] shrink-0"
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                      >
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={misiItem}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditMisiList((prev) => {
                            const copy = [...prev];
                            copy[idx] = val;
                            return copy;
                          });
                        }}
                        className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleMoveMisiItem(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                        title="Geser Naik"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveMisiItem(idx, 'down')}
                        disabled={idx === editMisiList.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                        title="Geser Turun"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMisiItem(idx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="Hapus Butir Misi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tambah butir misi baru */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Tulis butir misi baru lalu tekan Tambah..."
                    value={newMisiInput}
                    onChange={(e) => setNewMisiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMisiItem();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddMisiItem}
                    className="px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </button>
                </div>
              </div>

              {/* Sejarah Singkat */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Sejarah Singkat Lembaga
                </label>
                <textarea
                  rows={3}
                  value={editSejarah}
                  onChange={(e) => setEditSejarah(e.target.value)}
                  placeholder="Napak tilas pendirian, tokoh penggagas, atau tonggak sejarah sekolah..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              {/* Foto Gedung Sekolah */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span>Foto Gedung / Kampus Sekolah</span>
                  {isCompressingGedung && (
                    <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Mengompresi...
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-20 h-14 bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                    {editFotoGedung ? (
                      <img
                        src={editFotoGedung}
                        alt="Foto Gedung"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-5 h-5 opacity-60" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFotoGedungUpload}
                      className="text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-100 cursor-pointer"
                    />
                    {editFotoGedung && (
                      <button
                        type="button"
                        onClick={() => setEditFotoGedung('')}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer block"
                      >
                        Hapus Foto Gedung
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Kontak & Domisili Singkat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Jalan
                  </label>
                  <input
                    type="text"
                    value={editAlamat}
                    onChange={(e) => setEditAlamat(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kecamatan & Kota
                  </label>
                  <input
                    type="text"
                    value={`${editKecamatan}, ${editKota}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(',');
                      setEditKecamatan(parts[0]?.trim() || '');
                      if (parts[1]) setEditKota(parts[1]?.trim() || '');
                    }}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Telepon
                  </label>
                  <input
                    type="text"
                    value={editTelepon}
                    onChange={(e) => setEditTelepon(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer Save & Cancel Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditProfilOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  <Check className="w-4 h-4" />
                  Simpan Profil & Visi Misi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
