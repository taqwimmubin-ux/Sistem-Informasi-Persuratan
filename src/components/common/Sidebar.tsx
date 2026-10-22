import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Send,
  FileCheck2,
  FileSpreadsheet,
  Users,
  Settings,
  History,
  Trophy,
  X,
  Building2,
  Lock,
} from 'lucide-react';
import { Logo } from './Logo';
import { User, Disposisi, SuratKeluar, ProfilSekolah } from '../../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User;
  sekolah: ProfilSekolah;
  totalSuratMasuk: number;
  totalSuratKeluar: number;
  disposisiList: Disposisi[];
  suratKeluarList: SuratKeluar[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  sekolah,
  totalSuratMasuk,
  totalSuratKeluar,
  disposisiList,
  suratKeluarList,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Pending counts for this user
  const myPendingDisposisi = disposisiList.filter((d) =>
    d.tujuan.some((t) => t.userId === currentUser.id && (t.status === 'Baru' || t.status === 'Dibaca'))
  ).length;

  const pendingApprovals = suratKeluarList.filter(
    (sk) => sk.status === 'Menunggu Persetujuan'
  ).length;

  const isStaffRole =
    currentUser.role === 'waka_kurikulum' ||
    currentUser.role === 'waka_kesiswaan' ||
    currentUser.role === 'waka_guru_staf';

  // Navigation Items (Ensuring only ONE single Beranda/Dashboard route exists)
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Beranda',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'surat-masuk',
      label: 'Surat Masuk',
      icon: Inbox,
      badge: totalSuratMasuk > 0 ? totalSuratMasuk : null,
      badgeColor: 'bg-white/20 text-white',
    },
    {
      id: 'disposisi-saya',
      label: isStaffRole ? 'Tugas Disposisi Saya' : 'Disposisi Surat',
      icon: Send,
      badge: myPendingDisposisi > 0 ? myPendingDisposisi : null,
      badgeColor: 'bg-amber-400 text-amber-950 font-bold animate-pulse',
    },
    {
      id: 'surat-keluar',
      label: 'Surat Keluar',
      icon: FileCheck2,
      badge: currentUser.role === 'kepala_sekolah' && pendingApprovals > 0 ? pendingApprovals : null,
      badgeColor: 'bg-rose-500 text-white font-bold',
    },
    {
      id: 'laporan',
      label: 'Laporan & Arsip',
      icon: FileSpreadsheet,
      badge: null,
      badgeColor: '',
    },
    {
      id: 'profil-prestasi',
      label: 'Profil & Prestasi',
      icon: Trophy,
      badge: null,
      badgeColor: '',
    },
  ];

  const adminItems = [
    {
      id: 'manajemen-user',
      label: 'Kelola Pengguna & Akun',
      icon: Users,
    },
    {
      id: 'master-data',
      label: 'Master Kategori & Format',
      icon: Settings,
    },
    {
      id: 'pengaturan-sekolah',
      label: 'Pengaturan & Logo Sekolah',
      icon: Building2,
    },
    {
      id: 'log-aktivitas',
      label: 'Log Audit & Aktivitas',
      icon: History,
    },
  ];

  const handleSelectTab = (tabId: string) => {
    onTabChange(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container with dynamic theme gradient */}
      <aside
        style={{
          background:
            'linear-gradient(180deg, var(--theme-sidebar-start, #0f172a) 0%, var(--theme-sidebar-mid, #064e3b) 50%, var(--theme-sidebar-end, #022c22) 100%)',
        }}
        className={`no-print fixed top-0 bottom-0 left-0 z-40 w-72 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-white/10 shadow-2xl`}
      >
        {/* Top Header / Logo with custom logo support */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Logo
            size="md"
            showText={true}
            whiteText={true}
            customLogoUrl={sekolah.logoUrl}
            namaSekolah={sekolah.namaSekolah}
          />
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className="px-5 py-3.5 mx-3 mt-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.nama}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{currentUser.nama}</p>
            <p className="text-[11px] text-white/80 truncate">{currentUser.jabatan}</p>
            <div className="mt-1">
              <span
                className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/20"
                style={{ backgroundColor: 'rgba(var(--theme-primary-rgb, 5, 150, 105), 0.35)' }}
              >
                {currentUser.role === 'admin'
                  ? 'Admin / Operator'
                  : currentUser.role === 'kepala_sekolah'
                  ? 'Kepala Sekolah'
                  : currentUser.role === 'waka_kurikulum'
                  ? 'Waka Kurikulum'
                  : currentUser.role === 'waka_kesiswaan'
                  ? 'Waka Kesiswaan'
                  : 'Waka Guru & Staf'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Menu Navigation */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-white/60">
              Menu Utama
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    style={
                      isActive
                        ? {
                            backgroundColor: 'var(--theme-primary)',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                          }
                        : {}
                    }
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className="w-4 h-4 shrink-0"
                        style={isActive ? { color: '#ffffff' } : { color: 'var(--theme-primary-light, #a7f3d0)' }}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-white text-slate-900' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin System Management */}
          {currentUser.role === 'admin' && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center justify-between">
                <span>Manajemen Sistem</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-white/20 text-white rounded font-bold">
                  Admin
                </span>
              </div>
              <nav className="space-y-1">
                {adminItems.map((item) => {
                  const isActive = currentTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      style={
                        isActive
                          ? {
                              backgroundColor: 'var(--theme-primary)',
                              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                            }
                          : {}
                      }
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon
                        className="w-4 h-4 shrink-0"
                        style={isActive ? { color: '#ffffff' } : { color: 'var(--theme-primary-light, #a7f3d0)' }}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Non-admin restricted badge notice if waka/guru/kepsek */}
          {currentUser.role !== 'admin' && (
            <div className="mx-1 p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 text-white font-medium mb-1">
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                Akses Peran Terbatas
              </div>
              <p className="text-[10px] leading-relaxed text-slate-300/80">
                Menu konfigurasi instansi, format surat, dan kelola pengguna dikelola oleh Admin TU.
              </p>
            </div>
          )}
        </div>

        {/* School Footer Branding */}
        <div className="p-4 border-t border-white/10 text-center text-[10px] text-white/70">
          <div className="font-semibold">{sekolah.namaSekolah}</div>
          <div className="text-[9px] text-white/50 mt-0.5">Versi Sistem Persuratan Digital 2.5</div>
        </div>
      </aside>
    </>
  );
};
