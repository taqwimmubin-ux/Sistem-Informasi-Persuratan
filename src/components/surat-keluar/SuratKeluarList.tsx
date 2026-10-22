import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Search,
  Plus,
  Printer,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { SuratKeluar, KategoriSurat, User, StatusSuratKeluar } from '../../types';

interface SuratKeluarListProps {
  suratKeluarList: SuratKeluar[];
  kategoriList: KategoriSurat[];
  currentUser: User;
  onOpenCreateModal: () => void;
  onSelectSurat: (surat: SuratKeluar) => void;
  onEditSurat: (surat: SuratKeluar) => void;
  onDeleteSurat: (id: string) => void;
  onOpenPrint: (surat: SuratKeluar) => void;
}

export const SuratKeluarList: React.FC<SuratKeluarListProps> = ({
  suratKeluarList,
  kategoriList,
  currentUser,
  onOpenCreateModal,
  onSelectSurat,
  onEditSurat,
  onDeleteSurat,
  onOpenPrint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filter & Search
  const filteredList = useMemo(() => {
    return suratKeluarList.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !searchQuery ||
        item.nomorSurat.toLowerCase().includes(q) ||
        item.tujuan.toLowerCase().includes(q) ||
        item.perihal.toLowerCase().includes(q) ||
        item.ringkasan.toLowerCase().includes(q);

      const matchKategori = selectedKategori === 'ALL' || item.kategori === selectedKategori;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

      return matchQuery && matchKategori && matchStatus;
    });
  }, [suratKeluarList, searchQuery, selectedKategori, selectedStatus]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const getStatusBadge = (status: StatusSuratKeluar) => {
    switch (status) {
      case 'Disetujui':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Disetujui
          </span>
        );
      case 'Menunggu Persetujuan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" /> Perlu Approval
          </span>
        );
      case 'Terkirim':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Send className="w-3 h-3 text-blue-600" /> Terkirim
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" /> Ditolak
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-blue-700" />
            Buku Agenda Surat Keluar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan surat dinas resmi, verifikasi penomoran otomatis, dan alur persetujuan Kepala Sekolah
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Buat Surat Keluar
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nomor surat, tujuan, perihal..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedKategori}
              onChange={(e) => {
                setSelectedKategori(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
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
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="ALL">Semua Status Persetujuan</option>
              <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Terkirim">Terkirim</option>
              <option value="Draft">Draft</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nomor Surat</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Tujuan / Penerima</th>
                <th className="py-3 px-4">Perihal & Kategori</th>
                <th className="py-3 px-4">Penandatangan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileCheck2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada surat keluar ditemukan</p>
                  </td>
                </tr>
              ) : (
                paginatedList.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectSurat(item)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {item.nomorSurat}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {item.tanggalSurat}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800 max-w-[200px] truncate">
                      {item.tujuan}
                    </td>

                    <td className="py-3 px-4 max-w-[280px]">
                      <p className="font-medium text-slate-800 line-clamp-1">{item.perihal}</p>
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block">
                        {item.kategori}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium">
                      {item.penandatanganNama}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectSurat(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail & Persetujuan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenPrint(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Cetak Surat Resmi (Kop Sekolah)"
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
                                if (confirm(`Yakin ingin menghapus surat keluar no: ${item.nomorSurat}?`)) {
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
