import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  Check,
  Calendar,
  Building,
  Tag,
  Shield,
  File,
  Trash2,
} from 'lucide-react';
import { SuratMasuk, KategoriSurat, SifatSurat, LampiranFile } from '../../types';
import { StorageService } from '../../services/storage';

interface SuratMasukFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (surat: SuratMasuk) => void;
  editData?: SuratMasuk | null;
  kategoriList: KategoriSurat[];
}

export const SuratMasukFormModal: React.FC<SuratMasukFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editData,
  kategoriList,
}) => {
  const [nomorAgenda, setNomorAgenda] = useState('');
  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [tanggalDiterima, setTanggalDiterima] = useState('');
  const [pengirim, setPengirim] = useState('');
  const [alamatPengirim, setAlamatPengirim] = useState('');
  const [perihal, setPerihal] = useState('');
  const [kategori, setKategori] = useState('');
  const [sifat, setSifat] = useState<SifatSurat>('Biasa');
  const [ringkasan, setRingkasan] = useState('');
  const [lampiran, setLampiran] = useState<LampiranFile[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setNomorAgenda(editData.nomorAgenda);
        setNomorSurat(editData.nomorSurat);
        setTanggalSurat(editData.tanggalSurat);
        setTanggalDiterima(editData.tanggalDiterima);
        setPengirim(editData.pengirim);
        setAlamatPengirim(editData.alamatPengirim || '');
        setPerihal(editData.perihal);
        setKategori(editData.kategori);
        setSifat(editData.sifat);
        setRingkasan(editData.ringkasan);
        setLampiran(editData.lampiran || []);
      } else {
        // Auto-generate next agenda number
        const nextAgenda = StorageService.getNextNomorAgendaMasuk();
        setNomorAgenda(nextAgenda);
        setNomorSurat('');
        const today = new Date().toISOString().split('T')[0];
        setTanggalSurat(today);
        setTanggalDiterima(today);
        setPengirim('');
        setAlamatPengirim('');
        setPerihal('');
        setKategori(kategoriList[0]?.nama || 'Undangan Resmi');
        setSifat('Biasa');
        setRingkasan('');
        setLampiran([]);
      }
      setErrorMsg('');
    }
  }, [isOpen, editData, kategoriList]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal adalah 5 MB.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    const tipe: 'pdf' | 'image' | 'doc' =
      ext === 'pdf' ? 'pdf' : ['jpg', 'jpeg', 'png'].includes(ext || '') ? 'image' : 'doc';

    const newLamp: LampiranFile = {
      id: `lamp-${Date.now()}`,
      namaFile: file.name,
      ukuran: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      tipe,
    };

    setLampiran((prev) => [...prev, newLamp]);
    setErrorMsg('');
  };

  const removeLampiran = (id: string) => {
    setLampiran((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSurat.trim() || !pengirim.trim() || !perihal.trim()) {
      setErrorMsg('Mohon lengkapi Nomor Surat, Pengirim, dan Perihal.');
      return;
    }

    setIsSubmitting(true);
    const currentUser = StorageService.getCurrentUser();

    try {
      if (editData) {
        const updated = StorageService.updateSuratMasuk(editData.id, {
          nomorAgenda,
          nomorSurat,
          tanggalSurat,
          tanggalDiterima,
          pengirim,
          alamatPengirim,
          perihal,
          kategori,
          sifat,
          ringkasan,
          lampiran,
        });
        if (updated) onSaved(updated);
      } else {
        const created = StorageService.addSuratMasuk({
          nomorAgenda,
          nomorSurat,
          tanggalSurat,
          tanggalDiterima,
          pengirim,
          alamatPengirim,
          perihal,
          kategori,
          sifat,
          ringkasan,
          lampiran,
          statusDisposisi: 'Belum Didisposisi',
          dibuatOleh: currentUser.nama,
        });
        onSaved(created);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan surat masuk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {editData ? 'Edit Data Surat Masuk' : 'Pencatatan Surat Masuk Baru'}
              </h2>
              <p className="text-xs text-emerald-100">
                Agenda kearsipan resmi SMPIT Bunayya
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

          {/* Row 1: Nomor Agenda & Nomor Surat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Agenda (Otomatis) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nomorAgenda}
                onChange={(e) => setNomorAgenda(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Surat Asli <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                placeholder="Contoh: 421.3/124/Disdik/2026"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Tanggal Surat & Tanggal Diterima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Surat
              </label>
              <input
                type="date"
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Tanggal Diterima Sekolah
              </label>
              <input
                type="date"
                value={tanggalDiterima}
                onChange={(e) => setTanggalDiterima(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Pengirim & Alamat Pengirim */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Instansi / Pengirim Surat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={pengirim}
                onChange={(e) => setPengirim(e.target.value)}
                placeholder="Contoh: Dinas Pendidikan Kota Depok"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat / Kontak Pengirim
              </label>
              <input
                type="text"
                value={alamatPengirim}
                onChange={(e) => setAlamatPengirim(e.target.value)}
                placeholder="Contoh: Balaikota Depok Lt. 4"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Kategori & Sifat Surat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Kategori Surat
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none bg-white"
              >
                {kategoriList.map((kat) => (
                  <option key={kat.id} value={kat.nama}>
                    {kat.nama} ({kat.kode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
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
          </div>

          {/* Perihal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Perihal Surat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="Contoh: Undangan Rapat Koordinasi ANBK 2026 Jenjang SMP"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Ringkasan Isi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ringkasan / Catatan Isi Surat
            </label>
            <textarea
              rows={3}
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value)}
              placeholder="Tuliskan poin penting, batas waktu, atau pihak terkait yang disebutkan dalam surat..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          {/* Upload Lampiran File (Simulated Base64 / Mock File Attachment) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unggah Berkas / Lampiran Fisik (PDF / JPG / PNG, Maks 5MB)
            </label>

            <div className="mt-1 border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-emerald-400 transition-colors bg-slate-50/50">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <label className="cursor-pointer text-xs text-emerald-700 font-semibold hover:underline">
                Pilih file dari komputer
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                File otomatis diindeks untuk pratinjau digital kearsipan
              </p>
            </div>

            {/* Uploaded File List */}
            {lampiran.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {lampiran.map((lamp) => (
                  <div
                    key={lamp.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium truncate">{lamp.namaFile}</span>
                      <span className="text-[11px] text-slate-500">({lamp.ukuran})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLampiran(lamp.id)}
                      className="text-rose-600 hover:text-rose-800 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {editData ? 'Simpan Perubahan' : 'Simpan Surat Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
