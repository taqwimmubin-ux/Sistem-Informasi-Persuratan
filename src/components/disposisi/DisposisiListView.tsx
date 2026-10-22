import React, { useState } from 'react';
import {
  Send,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  AlertTriangle,
  MessageSquare,
  AlertCircle,
  Calendar,
  Check,
} from 'lucide-react';
import { Disposisi, User, SuratMasuk, StatusDisposisi } from '../../types';
import { StorageService } from '../../services/storage';

interface DisposisiListViewProps {
  disposisiList: Disposisi[];
  suratMasukList: SuratMasuk[];
  currentUser: User;
  onOpenPrintDisposisi: (surat: SuratMasuk, disp?: Disposisi | null) => void;
  onRefresh: () => void;
}

export const DisposisiListView: React.FC<DisposisiListViewProps> = ({
  disposisiList,
  suratMasukList,
  currentUser,
  onOpenPrintDisposisi,
  onRefresh,
}) => {
  const isStaffRole =
    currentUser.role === 'waka_kurikulum' ||
    currentUser.role === 'waka_kesiswaan' ||
    currentUser.role === 'waka_guru_staf';

  const [activeTab, setActiveTab] = useState<'saya' | 'semua'>(isStaffRole ? 'saya' : 'semua');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterOverdue, setFilterOverdue] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Response modal state
  const [selectedDispForResponse, setSelectedDispForResponse] = useState<Disposisi | null>(null);
  const [responseStatus, setResponseStatus] = useState<StatusDisposisi>('Diproses');
  const [responseNote, setResponseNote] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const isOverdue = (disp: Disposisi, userStatus?: StatusDisposisi) => {
    const isCompleted = userStatus ? userStatus === 'Selesai' : disp.statusGlobal === 'Selesai';
    return !isCompleted && disp.batasWaktu < todayStr;
  };

  // Filter logic
  const filteredDisposisi = disposisiList.filter((item) => {
    // Tab filtering
    if (activeTab === 'saya') {
      const isTarget = item.tujuan.some((t) => t.userId === currentUser.id);
      if (!isTarget) return false;
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      if (activeTab === 'saya') {
        const myTarget = item.tujuan.find((t) => t.userId === currentUser.id);
        if (myTarget?.status !== filterStatus) return false;
      } else {
        if (item.statusGlobal !== filterStatus) return false;
      }
    }

    // Overdue filter
    if (filterOverdue) {
      const myTarget = item.tujuan.find((t) => t.userId === currentUser.id);
      if (!isOverdue(item, myTarget?.status)) return false;
    }

    // Search query
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      item.nomorSurat.toLowerCase().includes(q) ||
      item.perihal.toLowerCase().includes(q) ||
      item.pemberiDisposisiNama.toLowerCase().includes(q)
    );
  });

  const handleOpenResponse = (disp: Disposisi) => {
    setSelectedDispForResponse(disp);
    const myTarget = disp.tujuan.find((t) => t.userId === currentUser.id);
    setResponseStatus(myTarget?.status || 'Diproses');
    setResponseNote(myTarget?.tanggapan || '');
  };

  const handleSaveResponse = () => {
    if (!selectedDispForResponse) return;
    StorageService.updateTanggapanDisposisi(
      selectedDispForResponse.id,
      currentUser.id,
      responseStatus,
      responseNote
    );
    setSelectedDispForResponse(null);
    onRefresh();
  };

  const getPriorityBadge = (p: Disposisi['prioritas']) => {
    switch (p) {
      case 'Sangat Segera':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            Sangat Segera
          </span>
        );
      case 'Segera':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Segera
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
            Biasa
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="w-6 h-6 text-emerald-700" />
            Manajemen Lembar Disposisi & Tugas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring tindak lanjut arahan pimpinan, pembaruan status pengerjaan, dan catatan hasil
          </p>
        </div>

        {/* Tab switch */}
        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('saya')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'saya'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tugas Ditujukan ke Saya
          </button>
          <button
            onClick={() => setActiveTab('semua')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'semua'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Disposisi Sekolah
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor surat, perihal, atau pemberi instruksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterOverdue(!filterOverdue)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
              filterOverdue
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Hanya yang Terlambat</span>
          </button>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="Baru">Baru</option>
            <option value="Dibaca">Dibaca</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Disposisi Cards List */}
      <div className="space-y-4">
        {filteredDisposisi.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h3 className="font-bold text-slate-700">Tidak ada lembar disposisi pada filter ini</h3>
            <p className="text-xs text-slate-500 mt-1">
              Seluruh arahan disposisi telah terselesaikan atau coba ubah kriteria pencarian.
            </p>
          </div>
        ) : (
          filteredDisposisi.map((disp) => {
            const surat = suratMasukList.find((s) => s.id === disp.suratMasukId);
            const myTarget = disp.tujuan.find((t) => t.userId === currentUser.id);
            const overdue = isOverdue(disp, myTarget?.status);

            return (
              <div
                key={disp.id}
                className={`bg-white rounded-2xl border transition-all p-5 space-y-4 shadow-xs ${
                  overdue ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200/80 hover:border-emerald-300'
                }`}
              >
                {/* Top header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      {disp.nomorSurat}
                    </span>
                    {getPriorityBadge(disp.prioritas)}
                    {overdue && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Terlambat (Lewat Batas)
                      </span>
                    )}
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Batas Waktu:{' '}
                      <strong className={overdue ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                        {disp.batasWaktu}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {surat && (
                      <button
                        onClick={() => onOpenPrintDisposisi(surat, disp)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Cetak Lembar Disposisi A4"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-700" />
                        Cetak A4
                      </button>
                    )}

                    {myTarget && (
                      <button
                        onClick={() => handleOpenResponse(disp)}
                        className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Update Status / Tanggapan
                      </button>
                    )}
                  </div>
                </div>

                {/* Perihal & Pemberi */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {disp.perihal}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>
                      Instruksi dari: <strong>{disp.pemberiDisposisiNama}</strong>
                    </span>
                    <span>•</span>
                    <span>Tanggal Terbit: {disp.tanggalDisposisi}</span>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs">
                  <p className="font-semibold text-slate-700 mb-1.5">Instruksi Arahan Pimpinan:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {disp.instruksi.map((ins, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium shadow-2xs"
                      >
                        ✓ {ins}
                      </span>
                    ))}
                  </div>
                  {disp.catatanKhusus && (
                    <p className="mt-2.5 text-xs italic text-slate-700 pt-2 border-t border-slate-200/80 font-serif">
                      "{disp.catatanKhusus}"
                    </p>
                  )}
                </div>

                {/* Target Assignees list (real-time progress monitoring) */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Progres Penerima Disposisi ({disp.tujuan.length} Pejabat/Staf):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {disp.tujuan.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate">{t.nama}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'Diproses'
                                ? 'bg-blue-100 text-blue-800'
                                : t.status === 'Dibaca'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{t.jabatan}</p>
                        {t.tanggapan ? (
                          <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[11px] text-emerald-950 font-serif italic bg-emerald-50/50 p-2 rounded">
                            💬 "{t.tanggapan}"
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic pt-1">
                            Belum ada catatan tindak lanjut
                          </div>
                        )}
                        {t.tanggalSelesai && (
                          <div className="text-[9px] text-emerald-700 font-sans font-medium">
                            Diselesaikan: {t.tanggalSelesai}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Response Modal */}
      {selectedDispForResponse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Tindak Lanjut & Tanggapan Disposisi</h3>
                <p className="text-[11px] text-emerald-100">
                  Perbarui progres pengerjaan instruksi pimpinan
                </p>
              </div>
              <button
                onClick={() => setSelectedDispForResponse(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block">
                  {selectedDispForResponse.perihal}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  No Surat: {selectedDispForResponse.nomorSurat} • Batas: {selectedDispForResponse.batasWaktu}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Pengerjaan Saat Ini
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Baru', 'Dibaca', 'Diproses', 'Selesai'] as StatusDisposisi[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setResponseStatus(st)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        responseStatus === st
                          ? st === 'Selesai'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : st === 'Diproses'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : st === 'Dibaca'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tindak Lanjut / Uraian Hasil
                </label>
                <textarea
                  rows={4}
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder="Contoh: 'Bismillah, rapat koordinasi dengan guru terkait telah dilaksanakan. Seluruh berkas administrasi telah disiapkan.'"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDispForResponse(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveResponse}
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Simpan Tindak Lanjut
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
