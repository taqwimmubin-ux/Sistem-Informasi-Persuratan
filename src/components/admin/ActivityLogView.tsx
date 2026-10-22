import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { LogAktivitas } from '../../types';

interface ActivityLogViewProps {
  logs: LogAktivitas[];
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModul, setSelectedModul] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Extract distinct users from logs
  const distinctUsers = useMemo(() => {
    const names = new Set<string>();
    logs.forEach((l) => names.add(l.userName));
    return Array.from(names);
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchQ =
        !searchQuery ||
        log.userName.toLowerCase().includes(q) ||
        log.aksi.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q) ||
        log.ipAddress.includes(q);

      const matchModul = selectedModul === 'ALL' || log.modul === selectedModul;
      const matchUser = selectedUser === 'ALL' || log.userName === selectedUser;

      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && log.timestamp.split(' ')[0] >= startDate;
      }
      if (endDate) {
        matchDate = matchDate && log.timestamp.split(' ')[0] <= endDate;
      }

      return matchQ && matchModul && matchUser && matchDate;
    });
  }, [logs, searchQuery, selectedModul, selectedUser, startDate, endDate]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const handleExportCSV = () => {
    const rows = [
      ['No', 'Waktu (WIB)', 'Nama Pengguna', 'Role', 'Aksi', 'Modul', 'Uraian Aktivitas', 'IP Address'],
    ];

    filteredLogs.forEach((l, idx) => {
      rows.push([
        String(idx + 1),
        l.timestamp,
        `"${l.userName.replace(/"/g, '""')}"`,
        l.userRole,
        l.aksi,
        l.modul,
        `"${l.detail.replace(/"/g, '""')}"`,
        l.ipAddress,
      ]);
    });

    const csvContent = '\uFEFF' + rows.map((e) => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Log_Audit_Aktivitas_SMPIT_Bunayya_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionColor = (aksi: string) => {
    if (aksi.startsWith('CREATE')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (aksi.startsWith('APPROVE')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (aksi.startsWith('UPDATE')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (aksi.startsWith('DELETE') || aksi.startsWith('REJECT'))
      return 'bg-rose-100 text-rose-800 border-rose-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-700" />
            Log Audit & Rekam Jejak Aktivitas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan otomatis seluruh aktivitas pengguna untuk akuntabilitas dan audit keamanan sistem
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Ekspor Log (CSV / Excel)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aksi, pengguna, atau detail aktivitas..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Modul Filter */}
          <div>
            <select
              value={selectedModul}
              onChange={(e) => {
                setSelectedModul(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">Semua Modul</option>
              <option value="Surat Masuk">Surat Masuk</option>
              <option value="Surat Keluar">Surat Keluar</option>
              <option value="Disposisi">Disposisi</option>
              <option value="Pengguna">Pengguna</option>
              <option value="Prestasi">Prestasi</option>
              <option value="Pengaturan">Pengaturan</option>
              <option value="Auth">Autentikasi (Login)</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="ALL">Semua Pengguna</option>
              {distinctUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 focus:outline-none"
              title="Dari Tanggal"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 focus:outline-none"
              title="Sampai Tanggal"
            />
          </div>
        </div>

        {/* Count and clear */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Menampilkan <strong className="text-slate-900">{filteredLogs.length}</strong> catatan aktivitas
          </span>
          {(searchQuery || selectedModul !== 'ALL' || selectedUser !== 'ALL' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedModul('ALL');
                setSelectedUser('ALL');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Uraian Detail Aktivitas</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-sans">
                    Tidak ada catatan aktivitas yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-900 whitespace-nowrap">
                      {log.userName}
                      <span className="block text-[10px] text-slate-400 font-normal font-sans">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionColor(
                          log.aksi
                        )}`}
                      >
                        {log.aksi}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700 whitespace-nowrap">
                      {log.modul}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-800 max-w-[380px] leading-relaxed">
                      {log.detail}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[10px]">
                      {log.ipAddress}
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
