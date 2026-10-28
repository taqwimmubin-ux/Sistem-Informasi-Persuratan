import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  FileText,
  Menu,
  ShieldCheck,
  UserCheck,
  Calendar,
  KeyRound,
  RefreshCw,
  CheckCheck,
  Award,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { User, Notifikasi } from '../../types';
import { StorageService } from '../../services/storage';
import { formatNamaPanggilan } from '../../utils/userUtils';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  onOpenMobileMenu: () => void;
  onOpenProfileModal: () => void;
  onResetData: () => void;
  allUsers: User[];
  notifikasiList: Notifikasi[];
  onRefreshNotifikasi: () => void;
  onNavigate: (tab: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  onOpenMobileMenu,
  onOpenProfileModal,
  onResetData,
  allUsers,
  notifikasiList,
  onRefreshNotifikasi,
  onNavigate,
  isDarkMode = false,
  onToggleDarkMode,
  onLogout,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Compute notifications for current user or broadcast ('ALL')
  const myNotifications = notifikasiList.filter(
    (n) => n.userId === currentUser.id || n.userId === 'ALL'
  );
  const unreadCount = myNotifications.filter((n) => !n.dibaca).length;

  const handleMarkAllRead = () => {
    StorageService.markAllNotifikasiAsRead(currentUser.id);
    onRefreshNotifikasi();
  };

  const handleNotificationClick = (notif: Notifikasi) => {
    StorageService.markNotifikasiAsRead(notif.id);
    onRefreshNotifikasi();
    setShowNotifMenu(false);
    onNavigate(notif.tautanModul);
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Admin / Operator
          </span>
        );
      case 'kepala_sekolah':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--theme-accent-gold-light)] text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-[var(--theme-accent-gold)]/40 dark:border-amber-800/60">
            <UserCheck className="w-3 h-3 text-[var(--theme-accent-gold)]" />
            Kepala Sekolah
          </span>
        );
      case 'waka_kurikulum':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800/70">
            <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Waka Kurikulum
          </span>
        );
      case 'waka_kesiswaan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800/70">
            <Award className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            Waka Kesiswaan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <FileText className="w-3 h-3 text-stone-500" />
            Waka Guru & Staf
          </span>
        );
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="no-print glass-header sticky top-0 z-30 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Islamic calendar indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5 lg:hidden focus:outline-none transition-colors"
            aria-label="Buka navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2.5 text-xs text-stone-500 dark:text-stone-400">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--theme-primary-light)] dark:bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] dark:text-[var(--theme-primary-light)]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-stone-800 dark:text-stone-200">{todayFormatted}</span>
            <span className="text-[var(--theme-accent-gold)] text-xs">•</span>
            <span className="font-medium text-stone-600 dark:text-stone-300 flex items-center gap-1">
              <span>Semester Ganjil 1448 H / 2026 M</span>
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle Button */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-stone-200/60 dark:border-white/10"
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Ubah mode tampilan"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-stone-600 animate-in -spin-in-90 duration-200" />
              )}
            </button>
          )}

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (
                confirm(
                  'Reset seluruh data ke kondisi awal demo (Surat Masuk, Disposisi, Surat Keluar, dan Prestasi)?'
                )
              ) {
                onResetData();
              }
            }}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-stone-200/60 dark:hover:border-white/10"
            title="Reset Data Demo ke Kondisi Awal"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-stone-200/60 dark:border-white/10"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[var(--theme-accent-gold)] text-[9px] font-bold text-stone-950 ring-2 ring-white dark:ring-[#0F1A17] shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#15231F] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-stone-200/80 dark:border-[#243A32]">
                <div className="px-4 py-3 border-b border-stone-100 dark:border-[#243A32] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 font-serif-luxury">
                      Notifikasi Persuratan
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--theme-accent-gold-light)] text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border border-[var(--theme-accent-gold)]/30">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors text-[var(--theme-primary)] hover:underline"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tandai dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-[#243A32]/60 text-xs">
                  {myNotifications.length === 0 ? (
                    <div className="p-8 text-center text-stone-400">
                      <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-[var(--theme-primary-light)]/60 dark:bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-stone-700 dark:text-stone-200">Tidak ada notifikasi</p>
                      <p className="text-[11px] mt-0.5 text-stone-500 dark:text-stone-400">Semua tugas dan pemberitahuan telah Anda periksa.</p>
                    </div>
                  ) : (
                    myNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 hover:bg-stone-50/90 dark:hover:bg-[#1E302A] cursor-pointer transition-colors ${
                          !notif.dibaca ? 'bg-[var(--theme-primary-light)]/30 dark:bg-[#1B2B26]' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`font-semibold text-xs line-clamp-1 ${
                              !notif.dibaca
                                ? 'font-bold text-stone-900 dark:text-white'
                                : 'text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            {notif.judul}
                          </span>
                          {!notif.dibaca && (
                            <span
                              className="w-2 h-2 rounded-full shrink-0 bg-[var(--theme-accent-gold)]"
                            ></span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {notif.pesan}
                        </p>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">
                          {notif.createdAt}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200/80 dark:border-white/10 hover:border-[var(--theme-accent-gold)]/60 hover:bg-stone-50/80 dark:hover:bg-white/5 transition-all text-left cursor-pointer shadow-xs"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.nama}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--theme-accent-gold)]/60"
              />
              <div className="hidden sm:block">
                <div
                  className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight max-w-[150px] md:max-w-[190px] truncate"
                  title={formatNamaPanggilan(currentUser)}
                >
                  {formatNamaPanggilan(currentUser)}
                </div>
                <div
                  className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight max-w-[150px] md:max-w-[190px] truncate"
                  title={currentUser.jabatan}
                >
                  {currentUser.jabatan}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2.5 w-76 rounded-2xl bg-white dark:bg-[#15231F] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-stone-200/80 dark:border-[#243A32]">
                {/* Active user header info */}
                <div className="px-4 py-3 border-b border-stone-100 dark:border-[#243A32] flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-stone-900 dark:text-white truncate" title={formatNamaPanggilan(currentUser)}>
                      {formatNamaPanggilan(currentUser)}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">@{currentUser.username}</p>
                  </div>
                  {getRoleBadge(currentUser.role)}
                </div>

                {/* Self profile action & Logout */}
                <div className="p-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenProfileModal();
                    }}
                    className="w-full px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-[var(--theme-primary)]" />
                    <span>Profil Saya & Ganti Kata Sandi</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-left flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Keluar (Halaman Login)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
