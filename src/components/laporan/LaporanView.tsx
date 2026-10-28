import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Calendar,
  Download,
  Printer,
  Search,
  Filter,
  Inbox,
  FileCheck2,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { SuratMasuk, SuratKeluar, KategoriSurat, ProfilSekolah } from '../../types';
import { StorageService } from '../../services/storage';

interface LaporanViewProps {
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  kategoriList: KategoriSurat[];
  sekolah: ProfilSekolah;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  suratMasukList,
  suratKeluarList,
  kategoriList,
  sekolah,
}) => {
  const [jenisLaporan, setJenisLaporan] = useState<'masuk' | 'keluar' | 'gabungan'>('masuk');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [selectedKategori, setSelectedKategori] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const adminUser = useMemo(() => {
    return (
      StorageService.getUsers().find((u) => u.role === 'admin') || {
        nama: 'Ustadz Muhammad Ramadhan, S.Pd., M.Pd.',
        nip: '19890415 201202 2 003',
      }
    );
  }, []);

  // Filtered incoming
  const filteredMasuk = useMemo(() => {
    return suratMasukList.filter((s) => {
      const matchDate = s.tanggalDiterima >= startDate && s.tanggalDiterima <= endDate;
      const matchKat = selectedKategori === 'ALL' || s.kategori === selectedKategori;
      const q = searchQuery.toLowerCase();
      const matchQ =
        !searchQuery ||
        s.nomorSurat.toLowerCase().includes(q) ||
        s.perihal.toLowerCase().includes(q) ||
        s.pengirim.toLowerCase().includes(q);
      return matchDate && matchKat && matchQ;
    });
  }, [suratMasukList, startDate, endDate, selectedKategori, searchQuery]);

  // Filtered outgoing
  const filteredKeluar = useMemo(() => {
    return suratKeluarList.filter((s) => {
      const matchDate = s.tanggalSurat >= startDate && s.tanggalSurat <= endDate;
      const matchKat = selectedKategori === 'ALL' || s.kategori === selectedKategori;
      const q = searchQuery.toLowerCase();
      const matchQ =
        !searchQuery ||
        s.nomorSurat.toLowerCase().includes(q) ||
        s.perihal.toLowerCase().includes(q) ||
        s.tujuan.toLowerCase().includes(q);
      return matchDate && matchKat && matchQ;
    });
  }, [suratKeluarList, startDate, endDate, selectedKategori, searchQuery]);

  // Export to Excel / CSV with BOM
  const handleExportCSV = () => {
    let rows: string[][] = [];
    let filename = '';

    if (jenisLaporan === 'masuk') {
      filename = `Rekap_Surat_Masuk_SMPIT_Bunayya_${startDate}_sd_${endDate}.csv`;
      rows.push(['No', 'No. Agenda', 'No. Surat Asli', 'Tgl Surat', 'Tgl Diterima', 'Pengirim / Asal', 'Perihal', 'Kategori', 'Sifat', 'Status Disposisi']);
      filteredMasuk.forEach((item, idx) => {
        rows.push([
          String(idx + 1),
          item.nomorAgenda,
          `"${item.nomorSurat.replace(/"/g, '""')}"`,
          item.tanggalSurat,
          item.tanggalDiterima,
          `"${item.pengirim.replace(/"/g, '""')}"`,
          `"${item.perihal.replace(/"/g, '""')}"`,
          item.kategori,
          item.sifat,
          item.statusDisposisi,
        ]);
      });
    } else {
      filename = `Rekap_Surat_Keluar_SMPIT_Bunayya_${startDate}_sd_${endDate}.csv`;
      rows.push(['No', 'No. Agenda', 'No. Surat', 'Tanggal Surat', 'Tujuan / Penerima', 'Perihal', 'Kategori', 'Sifat', 'Penandatangan', 'Status']);
      filteredKeluar.forEach((item, idx) => {
        rows.push([
          String(idx + 1),
          item.nomorAgenda,
          `"${item.nomorSurat.replace(/"/g, '""')}"`,
          item.tanggalSurat,
          `"${item.tujuan.replace(/"/g, '""')}"`,
          `"${item.perihal.replace(/"/g, '""')}"`,
          item.kategori,
          item.sifat,
          item.penandatanganNama,
          item.status,
        ]);
      });
    }

    const csvContent = '\uFEFF' + rows.map((e) => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
            Laporan Rekapitulasi & Arsip Digital
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan berkala surat masuk, surat keluar, ekspor Excel, dan cetak dokumen kearsipan resmi
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Ekspor Excel (CSV)
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            Cetak Rekap A4
          </button>
        </div>
      </div>

      {/* Filter Parameters Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Jenis Laporan Switch */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 mr-2">Pilih Buku Agenda:</span>
          <button
            onClick={() => setJenisLaporan('masuk')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              jenisLaporan === 'masuk'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Surat Masuk ({filteredMasuk.length})
          </button>
          <button
            onClick={() => setJenisLaporan('keluar')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              jenisLaporan === 'keluar'
                ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Surat Keluar ({filteredKeluar.length})
          </button>
        </div>

        {/* Date Filters & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Filter Kategori
            </label>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="ALL">Semua Kategori</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.nama}>
                  {kat.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pencarian Cepat
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rekap Table View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
            {jenisLaporan === 'masuk' ? 'Daftar Rekapitulasi Surat Masuk' : 'Daftar Rekapitulasi Surat Keluar'} ({jenisLaporan === 'masuk' ? filteredMasuk.length : filteredKeluar.length} arsip)
          </span>
          <span className="text-xs text-slate-500">
            Periode: <strong>{startDate}</strong> s.d. <strong>{endDate}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          {jenisLaporan === 'masuk' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">No. Agenda</th>
                  <th className="py-2.5 px-3">Tgl Diterima</th>
                  <th className="py-2.5 px-3">Nomor Surat</th>
                  <th className="py-2.5 px-3">Pengirim</th>
                  <th className="py-2.5 px-3">Perihal</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Sifat</th>
                  <th className="py-2.5 px-3">Status Disposisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMasuk.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Tidak ada arsip surat masuk pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredMasuk.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{s.nomorAgenda}</td>
                      <td className="py-2.5 px-3">{s.tanggalDiterima}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800">{s.nomorSurat}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{s.pengirim}</td>
                      <td className="py-2.5 px-3 max-w-[260px] line-clamp-1">{s.perihal}</td>
                      <td className="py-2.5 px-3">{s.kategori}</td>
                      <td className="py-2.5 px-3">{s.sifat}</td>
                      <td className="py-2.5 px-3 font-semibold">{s.statusDisposisi}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nomor Surat</th>
                  <th className="py-2.5 px-3">Tanggal Surat</th>
                  <th className="py-2.5 px-3">Tujuan</th>
                  <th className="py-2.5 px-3">Perihal</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Penandatangan</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKeluar.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Tidak ada arsip surat keluar pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredKeluar.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-900">{s.nomorSurat}</td>
                      <td className="py-2.5 px-3">{s.tanggalSurat}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{s.tujuan}</td>
                      <td className="py-2.5 px-3 max-w-[260px] line-clamp-1">{s.perihal}</td>
                      <td className="py-2.5 px-3">{s.kategori}</td>
                      <td className="py-2.5 px-3">{s.penandatanganNama}</td>
                      <td className="py-2.5 px-3 font-semibold">{s.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Print Modal for Official Rekapitulasi */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:rounded-none">
            {/* Control Bar */}
            <div className="no-print p-4 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
              <span className="font-bold text-sm">
                Pratinjau Cetak Laporan Rekapitulasi Dinas
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Cetak / Simpan PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="p-8 sm:p-12 text-black bg-white font-sans text-xs print-container">
              {/* Kop Surat */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-1 gap-4 text-center">
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  <Building className="w-12 h-12 text-emerald-800" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs uppercase font-semibold">{sekolah.yayasan}</h3>
                  <h1 className="text-lg font-extrabold uppercase">{sekolah.namaSekolah}</h1>
                  <p className="text-[10px] text-slate-700">
                    NPSN: {sekolah.npsn} • Akreditasi: {sekolah.akreditasi}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {sekolah.alamat}, {sekolah.kotaKabupaten} • Telp: {sekolah.telepon}
                  </p>
                </div>
                <div className="w-16 shrink-0"></div>
              </div>
              <div className="border-b-4 border-black mb-6"></div>

              {/* Judul Laporan */}
              <div className="text-center mb-6">
                <h2 className="text-base font-bold underline uppercase">
                  LAPORAN REKAPITULASI {jenisLaporan === 'masuk' ? 'SURAT MASUK' : 'SURAT KELUAR'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Periode: {startDate} s.d. {endDate}
                </p>
              </div>

              {/* Table */}
              <table className="w-full border-collapse border border-black text-[11px] mb-8">
                <thead>
                  <tr className="bg-slate-100 border border-black font-bold uppercase text-center">
                    <th className="border border-black p-1.5 w-8">No</th>
                    <th className="border border-black p-1.5">No. Agenda</th>
                    <th className="border border-black p-1.5">Nomor Surat</th>
                    <th className="border border-black p-1.5">Tanggal</th>
                    <th className="border border-black p-1.5">
                      {jenisLaporan === 'masuk' ? 'Pengirim' : 'Tujuan'}
                    </th>
                    <th className="border border-black p-1.5">Perihal</th>
                    <th className="border border-black p-1.5">Kategori</th>
                    <th className="border border-black p-1.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jenisLaporan === 'masuk' ? (
                    filteredMasuk.map((item, idx) => (
                      <tr key={item.id} className="border border-black">
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 font-mono text-center">{item.nomorAgenda}</td>
                        <td className="border border-black p-1.5 font-mono">{item.nomorSurat}</td>
                        <td className="border border-black p-1.5 text-center">{item.tanggalDiterima}</td>
                        <td className="border border-black p-1.5">{item.pengirim}</td>
                        <td className="border border-black p-1.5">{item.perihal}</td>
                        <td className="border border-black p-1.5 text-center">{item.kategori}</td>
                        <td className="border border-black p-1.5 text-center">{item.statusDisposisi}</td>
                      </tr>
                    ))
                  ) : (
                    filteredKeluar.map((item, idx) => (
                      <tr key={item.id} className="border border-black">
                        <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-black p-1.5 font-mono text-center">{item.nomorAgenda}</td>
                        <td className="border border-black p-1.5 font-mono">{item.nomorSurat}</td>
                        <td className="border border-black p-1.5 text-center">{item.tanggalSurat}</td>
                        <td className="border border-black p-1.5">{item.tujuan}</td>
                        <td className="border border-black p-1.5">{item.perihal}</td>
                        <td className="border border-black p-1.5 text-center">{item.kategori}</td>
                        <td className="border border-black p-1.5 text-center">{item.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Tanda Tangan Pengesahan */}
              <div className="flex justify-between items-start text-xs pt-4">
                <div className="text-center w-60">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Kepala SMPIT Bunayya</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{sekolah.kepalaSekolah}</p>
                  <p className="text-[11px] text-slate-600">NIP. {sekolah.nipKepalaSekolah}</p>
                </div>

                <div className="text-center w-60">
                  <p>Depok, {endDate}</p>
                  <p className="font-bold">Kepala Tata Usaha</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{adminUser.nama}</p>
                  <p className="text-[11px] text-slate-600">NIP. {adminUser.nip || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
