import React, { useState } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Tag,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { KategoriSurat, ProfilSekolah } from '../../types';
import { StorageService } from '../../services/storage';

interface MasterDataViewProps {
  kategoriList: KategoriSurat[];
  sekolah: ProfilSekolah;
  onRefresh: () => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  kategoriList,
  sekolah,
  onRefresh,
}) => {
  const [newKode, setNewKode] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newKet, setNewKet] = useState('');
  const [formatPattern, setFormatPattern] = useState(
    sekolah.formatNomorSuratKeluar || '{nomor}/SMPIT-BNY/{romawi}/{tahun}'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama.trim() || !newKode.trim()) return;

    StorageService.addKategori({
      kode: newKode.toUpperCase(),
      nama: newNama,
      keterangan: newKet || 'Kategori surat dinas SMPIT Bunayya',
      warnaBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    });

    setNewKode('');
    setNewNama('');
    setNewKet('');
    onRefresh();
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      StorageService.deleteKategori(id);
      onRefresh();
    }
  };

  const handleSaveFormat = () => {
    StorageService.saveSekolah({
      ...sekolah,
      formatNomorSuratKeluar: formatPattern,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onRefresh();
  };

  // Preview the format
  const now = new Date();
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const previewFormat = formatPattern
    .replace('{nomor}', '046')
    .replace('{romawi}', romanMonths[now.getMonth()])
    .replace('{tahun}', String(now.getFullYear()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-700" />
          Master Data Kategori & Format Penomoran
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi klasifikasi dokumen dinas dan formula otomatisasi penomoran surat keluar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Master Kategori Surat */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                Daftar Klasifikasi Kategori Surat
              </h2>
              <p className="text-xs text-slate-500">
                Kategori untuk pengelompokan surat masuk dan keluar
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {kategoriList.length} Kategori
            </span>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddCategory} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">
              + Tambah Kategori Baru:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Kode (contoh: SKP)"
                value={newKode}
                onChange={(e) => setNewKode(e.target.value)}
                required
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase"
              />
              <input
                type="text"
                placeholder="Nama Kategori (contoh: Surat Rekomendasi)"
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                required
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                Simpan Kategori
              </button>
            </div>
          </form>

          {/* Category List */}
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {kategoriList.map((kat) => (
              <div key={kat.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] shrink-0">
                    {kat.kode}
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 truncate">{kat.nama}</p>
                    <p className="text-[11px] text-slate-400 truncate">{kat.keterangan}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteCategory(kat.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Format Penomoran Surat Keluar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Format Penomoran Surat Keluar
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pola penomoran otomatis yang dicetak pada surat keluar
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pola Formula Format:
              </label>
              <input
                type="text"
                value={formatPattern}
                onChange={(e) => setFormatPattern(e.target.value)}
                className="w-full px-3 py-2 font-mono text-xs border border-slate-200 rounded-xl text-slate-800 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Variabel yang tersedia: <code className="bg-slate-100 px-1 rounded">{'{nomor}'}</code>,{' '}
                <code className="bg-slate-100 px-1 rounded">{'{romawi}'}</code>,{' '}
                <code className="bg-slate-100 px-1 rounded">{'{tahun}'}</code>
              </p>
            </div>

            {/* Live Preview Box */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                Hasil Pratinjau Penomoran:
              </span>
              <div className="font-mono font-extrabold text-blue-950 text-sm">
                {previewFormat}
              </div>
              <p className="text-[10px] text-blue-700">
                Surat berikutnya akan memakai nomor otomatis sesuai pola ini.
              </p>
            </div>

            <button
              onClick={handleSaveFormat}
              className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Simpan Format Penomoran
            </button>

            {saveSuccess && (
              <p className="text-center text-xs font-semibold text-emerald-600">
                ✓ Format penomoran berhasil diperbarui!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
