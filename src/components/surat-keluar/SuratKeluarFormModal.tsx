import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck2,
  Calendar,
  Send,
  Upload,
  FileText,
  AlertCircle,
  Building,
  Tag,
  Check,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { SuratKeluar, KategoriSurat, SifatSurat, LampiranFile, StatusSuratKeluar } from '../../types';
import { StorageService } from '../../services/storage';

interface SuratKeluarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (surat: SuratKeluar) => void;
  editData?: SuratKeluar | null;
  kategoriList: KategoriSurat[];
}

export const SuratKeluarFormModal: React.FC<SuratKeluarFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editData,
  kategoriList,
}) => {
  const [nomorSurat, setNomorSurat] = useState('');
  const [nomorAgenda, setNomorAgenda] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [tujuan, setTujuan] = useState('');
  const [alamatTujuan, setAlamatTujuan] = useState('');
  const [perihal, setPerihal] = useState('');
  const [kategori, setKategori] = useState('');
  const [sifat, setSifat] = useState<SifatSurat>('Biasa');
  const [ringkasan, setRingkasan] = useState('');
  const [isiSurat, setIsiSurat] = useState('');
  const [penandatanganNama, setPenandatanganNama] = useState('');
  const [penandatanganJabatan, setPenandatanganJabatan] = useState('');
  const [penandatanganNip, setPenandatanganNip] = useState('');
  const [status, setStatus] = useState<StatusSuratKeluar>('Menunggu Persetujuan');
  const [lampiran, setLampiran] = useState<LampiranFile[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const sekolah = StorageService.getSekolah();
      if (editData) {
        setNomorSurat(editData.nomorSurat);
        setNomorAgenda(editData.nomorAgenda);
        setTanggalSurat(editData.tanggalSurat);
        setTujuan(editData.tujuan);
        setAlamatTujuan(editData.alamatTujuan || '');
        setPerihal(editData.perihal);
        setKategori(editData.kategori);
        setSifat(editData.sifat);
        setRingkasan(editData.ringkasan);
        setIsiSurat(editData.isiSurat || '');
        setPenandatanganNama(editData.penandatanganNama);
        setPenandatanganJabatan(editData.penandatanganJabatan);
        setPenandatanganNip(editData.penandatanganNip || '');
        setStatus(editData.status);
        setLampiran(editData.lampiran || []);
      } else {
        const next = StorageService.getNextNomorSuratKeluar();
        setNomorSurat(next.nomorSurat);
        setNomorAgenda(next.nomorAgenda);
        const today = new Date().toISOString().split('T')[0];
        setTanggalSurat(today);
        setTujuan('');
        setAlamatTujuan('Di Tempat');
        setPerihal('');
        setKategori(kategoriList[0]?.nama || 'Undangan Resmi');
        setSifat('Biasa');
        setRingkasan('');
        setIsiSurat('');
        setPenandatanganNama(sekolah.kepalaSekolah);
        setPenandatanganJabatan('Kepala Sekolah');
        setPenandatanganNip(sekolah.nipKepalaSekolah);
        setStatus('Menunggu Persetujuan');
        setLampiran([]);
      }
      setErrorMsg('');
    }
  }, [isOpen, editData, kategoriList]);

  if (!isOpen) return null;

  const handleUseStandardTemplate = () => {
    const defaultBody = `Assalamu’alaikum Warahmatullahi Wabarakatuh.

Segala puji bagi Allah SWT, Tuhan Semesta Alam, yang senantiasa melimpahkan taufiq dan karunia-Nya kepada kita semua. Shalawat serta salam semoga tercurah kepada junjungan Nabi Agung Muhammad SAW.

Sehubungan dengan ${perihal || 'kegiatan sekolah'}, bersama ini kami sampaikan bahwa SMPIT Bunayya bermaksud untuk ${ringkasan || 'mengadakan koordinasi program kerja'}.

Adapun pelaksanaan kegiatan direncanakan pada:
Hari/Tanggal : Senin, 02 November 2026
Waktu        : Pukul 08.30 WIB s.d. selesai
Tempat       : Aula Utama SMPIT Bunayya

Demikian surat ini kami sampaikan. Atas perhatian, perkenan, dan kerjasama yang baik, kami ucapkan jazakumullahu khairan katsiran.

Wassalamu’alaikum Warahmatullahi Wabarakatuh.`;
    setIsiSurat(defaultBody);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 5 MB.');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    const tipe: 'pdf' | 'image' | 'doc' =
      ext === 'pdf' ? 'pdf' : ['jpg', 'jpeg', 'png'].includes(ext || '') ? 'image' : 'doc';

    const newLamp: LampiranFile = {
      id: `lamp-sk-${Date.now()}`,
      namaFile: file.name,
      ukuran: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      tipe,
    };
    setLampiran((prev) => [...prev, newLamp]);
  };

  const removeLampiran = (id: string) => {
    setLampiran((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSurat.trim() || !tujuan.trim() || !perihal.trim()) {
      setErrorMsg('Mohon lengkapi Nomor Surat, Tujuan, dan Perihal.');
      return;
    }

    const currentUser = StorageService.getCurrentUser();

    if (editData) {
      const updated = StorageService.updateSuratKeluar(editData.id, {
        nomorSurat,
        nomorAgenda,
        tanggalSurat,
        tujuan,
        alamatTujuan,
        perihal,
        kategori,
        sifat,
        ringkasan,
        isiSurat,
        penandatanganNama,
        penandatanganJabatan,
        penandatanganNip,
        status,
        lampiran,
      });
      if (updated) onSaved(updated);
    } else {
      const created = StorageService.addSuratKeluar({
        nomorSurat,
        nomorAgenda,
        tanggalSurat,
        tujuan,
        alamatTujuan,
        perihal,
        kategori,
        sifat,
        ringkasan,
        isiSurat,
        penandatanganNama,
        penandatanganJabatan,
        penandatanganNip,
        status,
        lampiran,
        dibuatOleh: currentUser.nama,
      });
      onSaved(created);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileCheck2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {editData ? 'Edit Data Surat Keluar' : 'Penerbitan Surat Keluar Baru'}
              </h2>
              <p className="text-xs text-blue-200">
                Format resmi tata persuratan dinas SMPIT Bunayya
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Nomor Surat & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Surat Keluar (Penomoran Otomatis) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                required
                className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-xl text-xs font-mono font-bold text-blue-950 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Tanggal Surat
              </label>
              <input
                type="date"
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Tujuan & Alamat Tujuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tujuan / Kepada Yth. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                placeholder="Contoh: Orang Tua / Wali Santri Kelas IX"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat / Tempat Tujuan
              </label>
              <input
                type="text"
                value={alamatTujuan}
                onChange={(e) => setAlamatTujuan(e.target.value)}
                placeholder="Contoh: Di Tempat / Kota Depok"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Perihal & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perihal Surat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={perihal}
                onChange={(e) => setPerihal(e.target.value)}
                placeholder="Contoh: Pemberitahuan Pelaksanaan Wisuda Tahfidz"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Kategori Surat
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
              >
                {kategoriList.map((kat) => (
                  <option key={kat.id} value={kat.nama}>
                    {kat.nama} ({kat.kode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sifat & Status Alur Persetujuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sifat Surat
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Biasa', 'Penting', 'Segera', 'Rahasia'] as SifatSurat[]).map((sf) => (
                  <button
                    key={sf}
                    type="button"
                    onClick={() => setSifat(sf)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                      sifat === sf
                        ? sf === 'Rahasia'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : sf === 'Segera'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : sf === 'Penting'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sf}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alur Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusSuratKeluar)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-blue-500 focus:outline-none bg-white"
              >
                <option value="Draft">Draft (Konsep)</option>
                <option value="Menunggu Persetujuan">Menunggu Persetujuan Kepala Sekolah</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Terkirim">Terkirim</option>
              </select>
            </div>
          </div>

          {/* Isi Lengkap Surat Template Generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Isi Surat Lengkap (Siap Cetak dengan Kop Resmi)
              </label>
              <button
                type="button"
                onClick={handleUseStandardTemplate}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Gunakan Template Format Standar
              </button>
            </div>
            <textarea
              rows={6}
              value={isiSurat}
              onChange={(e) => setIsiSurat(e.target.value)}
              placeholder="Tuliskan isi surat resmi mulai dari salam pembuka, batang tubuh surat, waktu dan tempat (bila ada), hingga penutup..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-serif text-slate-800 focus:border-blue-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Penandatangan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Penandatangan
              </label>
              <input
                type="text"
                value={penandatanganNama}
                onChange={(e) => setPenandatanganNama(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan Penandatangan
              </label>
              <input
                type="text"
                value={penandatanganJabatan}
                onChange={(e) => setPenandatanganJabatan(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lampiran File Pendukung (Opsional)
            </label>
            <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center bg-slate-50/50">
              <label className="cursor-pointer text-xs text-blue-700 font-semibold hover:underline">
                Unggah lampiran dokumen
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {lampiran.length > 0 && (
              <div className="mt-2 space-y-1">
                {lampiran.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-950"
                  >
                    <span className="truncate">{l.namaFile} ({l.ukuran})</span>
                    <button
                      type="button"
                      onClick={() => removeLampiran(l.id)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 transition-all shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {editData ? 'Simpan Perubahan' : 'Terbitkan Surat Keluar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
