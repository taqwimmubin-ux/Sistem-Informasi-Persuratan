import React from 'react';
import {
  Inbox,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  ArrowRight,
  TrendingUp,
  FileText,
  Calendar,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { SuratMasuk, SuratKeluar, Disposisi, User, ProfilSekolah } from '../../types';
import { formatNamaPanggilan } from '../../utils/userUtils';
import { BannerWatermarkLogo } from '../common/BannerWatermarkLogo';

interface DashboardViewProps {
  currentUser: User;
  sekolah?: ProfilSekolah;
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  disposisiList: Disposisi[];
  onNavigate: (tab: string) => void;
  onOpenCreateSuratMasuk: () => void;
  onOpenCreateSuratKeluar: () => void;
  onSelectSuratMasuk: (surat: SuratMasuk) => void;
  onSelectSuratKeluar: (surat: SuratKeluar) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  sekolah,
  suratMasukList,
  suratKeluarList,
  disposisiList,
  onNavigate,
  onOpenCreateSuratMasuk,
  onOpenCreateSuratKeluar,
  onSelectSuratMasuk,
  onSelectSuratKeluar,
}) => {
  // Metrics calculation
  const totalMasuk = suratMasukList.length;
  const totalKeluar = suratKeluarList.length;

  const belumDidisposisi = suratMasukList.filter(
    (s) => s.statusDisposisi === 'Belum Didisposisi'
  ).length;

  const pendingDisposisiSaya = disposisiList.filter((d) =>
    d.tujuan.some((t) => t.userId === currentUser.id && t.status !== 'Selesai')
  );

  const pendingApprovalKepsek = suratKeluarList.filter(
    (sk) => sk.status === 'Menunggu Persetujuan'
  );

  // Recent 5 letters
  const recentMasuk = [...suratMasukList]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentKeluar = [...suratKeluarList]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Month traffic sample
  const monthlyData = [
    { bulan: 'Mei', masuk: 12, keluar: 8 },
    { bulan: 'Jun', masuk: 18, keluar: 14 },
    { bulan: 'Jul', masuk: 28, keluar: 22 }, // Tahun ajaran baru
    { bulan: 'Agu', masuk: 24, keluar: 19 },
    { bulan: 'Sep', masuk: 31, keluar: 25 },
    { bulan: 'Okt', masuk: totalMasuk, keluar: totalKeluar },
  ];

  const maxVal = Math.max(...monthlyData.flatMap((d) => [d.masuk, d.keluar]));

  const getSifatBadge = (sifat: SuratMasuk['sifat']) => {
    switch (sifat) {
      case 'Rahasia':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Rahasia</span>;
      case 'Segera':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">Segera</span>;
      case 'Penting':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">Penting</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300">Biasa</span>;
    }
  };

  const getStatusSuratKeluarBadge = (status: SuratKeluar['status']) => {
    switch (status) {
      case 'Disetujui':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Disetujui</span>;
      case 'Menunggu Persetujuan':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">Menunggu Persetujuan</span>;
      case 'Terkirim':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">Terkirim</span>;
      case 'Ditolak':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">Ditolak</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-lg shadow-emerald-950/20">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-medium mb-3 border border-white/10">
            <span>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
            <span>•</span>
            <span>Sistem Informasi Persuratan Terpadu</span>
          </div>
          {/* Sapaan Ahlan wa Sahlan Tulisan Arab & Nama Lengkap Otomatis */}
          <div className="space-y-1 mb-2">
            <div
              lang="ar"
              dir="rtl"
              className="text-2xl sm:text-3xl md:text-4xl text-amber-200 dark:text-amber-300 font-normal drop-shadow-sm font-arabic inline-block select-none"
              style={{ fontFamily: "'Aref Ruqaa', 'Amiri', 'Traditional Arabic', serif" }}
            >
              أَهْلًا وَسَهْلًا
            </div>
            <h1
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight break-words leading-tight"
              title={formatNamaPanggilan(currentUser)}
            >
              {formatNamaPanggilan(currentUser)}
            </h1>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl break-words">
            Selamat datang di Aplikasi E-Surat Keluar & Masuk Sekolah Model SMPIT Bunayya. Kelola surat masuk, disposisi instruksi dinas, dan pengesahan surat keluar dengan tertib, transparan, dan terarsip digital.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={onOpenCreateSuratMasuk}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Catat Surat Masuk
                </button>
                <button
                  onClick={onOpenCreateSuratKeluar}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs transition-all border border-white/20 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-300" />
                  Buat Surat Keluar
                </button>
              </>
            )}

            {currentUser.role === 'kepala_sekolah' && (
              <>
                <button
                  onClick={() => onNavigate('surat-keluar')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 transition-all shadow-md cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  Persetujuan Surat ({pendingApprovalKepsek.length})
                </button>
                <button
                  onClick={() => onNavigate('surat-masuk')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs transition-all border border-white/20 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-emerald-300" />
                  Disposisikan Surat Masuk
                </button>
              </>
            )}

            {currentUser.role === 'waka_guru_staf' && (
              <button
                onClick={() => onNavigate('disposisi-saya')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-900 hover:bg-amber-300 transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Buka Tugas Disposisi Saya ({pendingDisposisiSaya.length})
              </button>
            )}

            <button
              onClick={() => onNavigate('laporan')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700/60 hover:bg-emerald-700 text-white transition-all border border-emerald-500/40 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              Laporan & Rekapitulasi
            </button>
          </div>
        </div>

        {/* Ilustrasi Garis (Line-Art) Tema Persuratan Digital SMPIT Bunayya */}
        <BannerWatermarkLogo />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Surat Masuk */}
        <div
          onClick={() => onNavigate('surat-masuk')}
          className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Surat Masuk
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalMasuk}</span>
            <span className="text-xs font-medium text-emerald-600">Surat terdaftar</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Buku agenda digital</span>
            <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Buka <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 2: Surat Keluar */}
        <div
          onClick={() => onNavigate('surat-keluar')}
          className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Surat Keluar
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalKeluar}</span>
            <span className="text-xs font-medium text-blue-600">Surat keluar</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>{suratKeluarList.filter((s) => s.status === 'Disetujui').length} Disetujui</span>
            <span className="text-blue-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Buka <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 3: Belum Disposisi */}
        <div
          onClick={() => onNavigate('surat-masuk')}
          className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Belum Didisposisi
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{belumDidisposisi}</span>
            <span className="text-xs font-medium text-slate-500">Menunggu arahan</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Kepala Sekolah / TU</span>
            <span className="text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Tindak <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card 4: Disposisi Saya / Approval */}
        <div
          onClick={() => {
            if (currentUser.role === 'kepala_sekolah') onNavigate('surat-keluar');
            else onNavigate('disposisi-saya');
          }}
          className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {currentUser.role === 'kepala_sekolah' ? 'Perlu Disetujui' : 'Tugas Disposisi'}
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-700">
              {currentUser.role === 'kepala_sekolah'
                ? pendingApprovalKepsek.length
                : pendingDisposisiSaya.length}
            </span>
            <span className="text-xs font-medium text-teal-600">Tugas aktif</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Prioritas kerja</span>
            <span className="text-teal-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Lihat <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Visual Chart & User Task Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Traffic & Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Statistik Lalu Lintas Surat (Tahun 2026)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Perbandingan volume surat masuk dan surat keluar SMPIT Bunayya per bulan
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-600"></span>
                <span className="text-slate-600 font-medium">Surat Masuk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-blue-500"></span>
                <span className="text-slate-600 font-medium">Surat Keluar</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-6 h-56 flex items-end gap-4 sm:gap-8 px-2">
            {monthlyData.map((item, idx) => {
              const masukHeight = Math.max(12, (item.masuk / maxVal) * 100);
              const keluarHeight = Math.max(12, (item.keluar / maxVal) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Masuk Bar */}
                    <div
                      style={{ height: `${masukHeight}%` }}
                      className="w-1/2 max-w-[28px] rounded-t-md bg-emerald-600 hover:bg-emerald-700 transition-all relative group flex justify-center"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity">
                        {item.masuk}
                      </div>
                    </div>
                    {/* Keluar Bar */}
                    <div
                      style={{ height: `${keluarHeight}%` }}
                      className="w-1/2 max-w-[28px] rounded-t-md bg-blue-500 hover:bg-blue-600 transition-all relative group flex justify-center"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity">
                        {item.keluar}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{item.bulan}</span>
                </div>
              );
            })}
          </div>

          {/* Quick Summary Highlights */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-slate-500 text-[11px]">Rata-rata/Bulan</div>
              <div className="font-bold text-slate-800 mt-0.5">24.5 Surat</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-slate-500 text-[11px]">Bulan Tertinggi</div>
              <div className="font-bold text-emerald-700 mt-0.5">September (31)</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <div className="text-slate-500 text-[11px]">Tingkat Disposisi</div>
              <div className="font-bold text-teal-700 mt-0.5">
                {Math.round(((totalMasuk - belumDidisposisi) / (totalMasuk || 1)) * 100)}% Selesai
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Urgent Tasks & Personal Dispositions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500" />
                Tugas Disposisi Anda
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                {pendingDisposisiSaya.length} Menunggu
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {pendingDisposisiSaya.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-semibold text-slate-700">Alhamdulillah, tidak ada tanggungan!</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Seluruh lembar disposisi instruksi pimpinan telah Anda tanggapi.
                  </p>
                </div>
              ) : (
                pendingDisposisiSaya.slice(0, 3).map((disp) => {
                  const myTarget = disp.tujuan.find((t) => t.userId === currentUser.id);
                  return (
                    <div
                      key={disp.id}
                      onClick={() => onNavigate('disposisi-saya')}
                      className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-900 truncate max-w-[170px]">
                          {disp.nomorSurat}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                          {disp.prioritas}
                        </span>
                      </div>
                      <p className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                        {disp.perihal}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Batas: <strong className="text-slate-700">{disp.batasWaktu}</strong></span>
                        <span className="font-medium text-amber-800">
                          Status: {myTarget?.status || 'Baru'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('disposisi-saya')}
              className="w-full py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              Lihat Semua Disposisi
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dual Table: Recent Surat Masuk & Recent Surat Keluar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5 Surat Masuk Terbaru */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-emerald-600" />
                Surat Masuk Terbaru
              </h2>
              <p className="text-[11px] text-slate-500">Agenda penerimaan surat masuk terkini</p>
            </div>
            <button
              onClick={() => onNavigate('surat-masuk')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {recentMasuk.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectSuratMasuk(item)}
                className="py-3 px-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-xs flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 truncate">{item.pengirim}</span>
                    {getSifatBadge(item.sifat)}
                  </div>
                  <p className="font-medium text-slate-700 line-clamp-1">{item.perihal}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>No: {item.nomorSurat}</span>
                    <span>•</span>
                    <span>Diterima: {item.tanggalDiterima}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.statusDisposisi === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.statusDisposisi === 'Sudah Didisposisi'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.statusDisposisi}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Surat Keluar Terbaru */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                Surat Keluar Terbaru
              </h2>
              <p className="text-[11px] text-slate-500">Draft dan surat dinas yang diterbitkan sekolah</p>
            </div>
            <button
              onClick={() => onNavigate('surat-keluar')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              Semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {recentKeluar.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectSuratKeluar(item)}
                className="py-3 px-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-xs flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900 truncate">{item.nomorSurat}</span>
                    {getStatusSuratKeluarBadge(item.status)}
                  </div>
                  <p className="font-medium text-slate-700 line-clamp-1">{item.perihal}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>Tujuan: {item.tujuan}</span>
                    <span>•</span>
                    <span>Tanggal: {item.tanggalSurat}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <button className="p-1 text-slate-400 hover:text-slate-600">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
