import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  Plus,
  Send,
  Eye,
  Edit,
  Trash2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle2,
  Paperclip,
  ArrowUpDown,
  Lock,
} from 'lucide-react';
import { SuratMasuk, KategoriSurat, SifatSurat, User, Disposisi } from '../../types';

interface SuratMasukListProps {
  suratMasukList: SuratMasuk[];
  kategoriList: KategoriSurat[];
  currentUser: User;
  disposisiList: Disposisi[];
  onOpenCreateModal: () => void;
  onSelectSurat: (surat: SuratMasuk) => void;
  onEditSurat: (surat: SuratMasuk) => void;
  onDeleteSurat: (id: string) => void;
  onOpenDisposisiModal: (surat: SuratMasuk) => void;
  onOpenPrintDisposisi: (surat: SuratMasuk, disp?: Disposisi | null) => void;
}

export const SuratMasukList: React.FC<SuratMasukListProps> = ({
  suratMasukList,
  kategoriList,
  currentUser,
  disposisiList,
  onOpenCreateModal,
  onSelectSurat,
  onEditSurat,
  onDeleteSurat,
  onOpenDisposisiModal,
  onOpenPrintDisposisi,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('ALL');
  const [selectedSifat, setSelectedSifat] = useState<string>('ALL');
  const [selectedStatusDisposisi, setSelectedStatusDisposisi] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'tanggal_desc' | 'tanggal_asc' | 'agenda_desc'>('tanggal_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filter & Search logic
  const filteredList = useMemo(() => {
    return suratMasukList.filter((item) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        item.nomorSurat.toLowerCase().includes(q) ||
        item.nomorAgenda.toLowerCase().includes(q) ||
        item.perihal.toLowerCase().includes(q) ||
        item.pengirim.toLowerCase().includes(q) ||
        item.ringkasan.toLowerCase().includes(q);

      // Category
      const matchKategori = selectedKategori === 'ALL' || item.kategori === selectedKategori;

      // Sifat
      const matchSifat = selectedSifat === 'ALL' || item.sifat === selectedSifat;

      // Status Disposisi
      const matchStatus =
        selectedStatusDisposisi === 'ALL' || item.statusDisposisi === selectedStatusDisposisi;

      return matchQuery && matchKategori && matchSifat && matchStatus;
    }).sort((a, b) => {
      if (sortBy === 'tanggal_desc') {
        return new Date(b.tanggalDiterima).getTime() - new Date(a.tanggalDiterima).getTime();
      }
      if (sortBy === 'tanggal_asc') {
        return new Date(a.tanggalDiterima).getTime() - new Date(b.tanggalDiterima).getTime();
      }
      return b.nomorAgenda.localeCompare(a.nomorAgenda);
    });
  }, [suratMasukList, searchQuery, selectedKategori, selectedSifat, selectedStatusDisposisi, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const getSifatBadge = (sifat: SifatSurat) => {
    switch (sifat) {
      case 'Rahasia':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300"><Lock className="w-3 h-3" /> Rahasia</span>;
      case 'Segera':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">Segera</span>;
      case 'Penting':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">Penting</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300">Biasa</span>;
    }
  };

  const getStatusDisposisiBadge = (status: SuratMasuk['statusDisposisi']) => {
    switch (status) {
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selesai
          </span>
        );
      case 'Sudah Didisposisi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Send className="w-3 h-3 text-blue-600" /> Didisposisi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" /> Belum
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Module Title & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Inbox className="w-6 h-6 text-emerald-700" />
            Buku Agenda Surat Masuk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan, pengarsipan berkas dinas, dan distribusi lembar disposisi instruksi
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Catat Surat Masuk
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Field */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari perihal, nomor surat, pengirim..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Kategori Filter */}
          <div>
            <select
              value={selectedKategori}
              onChange={(e) => {
                setSelectedKategori(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">Semua Kategori</option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.nama}>
                  {kat.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Sifat Filter */}
          <div>
            <select
              value={selectedSifat}
              onChange={(e) => {
                setSelectedSifat(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">Semua Sifat</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
              <option value="Segera">Segera</option>
              <option value="Rahasia">Rahasia</option>
            </select>
          </div>

          {/* Status Disposisi Filter */}
          <div>
            <select
              value={selectedStatusDisposisi}
              onChange={(e) => {
                setSelectedStatusDisposisi(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">Status Disposisi</option>
              <option value="Belum Didisposisi">Belum Didisposisi</option>
              <option value="Sudah Didisposisi">Sudah Didisposisi</option>
              <option value="Selesai">Disposisi Selesai</option>
            </select>
          </div>
        </div>

        {/* Active Filters count & reset indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredList.length}</strong> dari{' '}
            {suratMasukList.length} surat masuk
          </span>

          {(searchQuery || selectedKategori !== 'ALL' || selectedSifat !== 'ALL' || selectedStatusDisposisi !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedKategori('ALL');
                setSelectedSifat('ALL');
                setSelectedStatusDisposisi('ALL');
                setCurrentPage(1);
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">No. Agenda</th>
                <th className="py-3 px-4">Nomor & Tanggal</th>
                <th className="py-3 px-4">Asal Pengirim</th>
                <th className="py-3 px-4">Perihal & Kategori</th>
                <th className="py-3 px-4">Sifat</th>
                <th className="py-3 px-4">Status Disposisi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada data surat masuk ditemukan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Coba sesuaikan kata kunci pencarian atau bersihkan filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => {
                  const disp = disposisiList.find((d) => d.suratMasukId === item.id);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectSurat(item)}
                    >
                      {/* Agenda */}
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                        {item.nomorAgenda}
                      </td>

                      {/* Nomor & Tanggal */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-900">{item.nomorSurat}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>Surat: {item.tanggalSurat}</span>
                          <span>•</span>
                          <span>Diterima: {item.tanggalDiterima}</span>
                        </div>
                      </td>

                      {/* Asal Pengirim */}
                      <td className="py-3 px-4 font-semibold text-slate-800 max-w-[200px] truncate">
                        {item.pengirim}
                      </td>

                      {/* Perihal & Kategori */}
                      <td className="py-3 px-4 max-w-[280px]">
                        <p className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                          {item.perihal}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.kategori}
                          </span>
                          {item.lampiran?.length > 0 && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                              <Paperclip className="w-3 h-3 text-slate-400" />
                              {item.lampiran.length} file
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sifat */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getSifatBadge(item.sifat)}
                      </td>

                      {/* Status Disposisi */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStatusDisposisiBadge(item.statusDisposisi)}
                      </td>

                      {/* Aksi Buttons */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSelectSurat(item)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail Dokumen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(currentUser.role === 'admin' || currentUser.role === 'kepala_sekolah') && (
                            <button
                              onClick={() => onOpenDisposisiModal(item)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Buat Disposisi"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onOpenPrintDisposisi(item, disp)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Cetak Lembar Disposisi A4"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {currentUser.role === 'admin' && (
                            <>
                              <button
                                onClick={() => onEditSurat(item)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit Surat"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus surat masuk no: ${item.nomorSurat}?`)) {
                                    onDeleteSurat(item.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Surat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Halaman <strong className="text-slate-900">{currentPage}</strong> dari{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                  currentPage === page
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
