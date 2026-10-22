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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Admin / Operator
          </span>
        );
      case 'kepala_sekolah':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <UserCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Kepala Sekolah
          </span>
        );
      case 'waka_kurikulum':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Waka Kurikulum
          </span>
        );
      case 'waka_kesiswaan':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
            <Award className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            Waka Kesiswaan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <FileText className="w-3 h-3 text-slate-500" />
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
    <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-2xs transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Indonesian school calendar */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
            aria-label="Buka navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{todayFormatted}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-medium" style={{ color: 'var(--theme-primary)' }}>
              Semester Ganjil 1448 H / 2026 M
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle Button */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              aria-label="Ubah mode tampilan"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-90 duration-200" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600 animate-in -spin-in-90 duration-200" />
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
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Reset Data Demo ke Kondisi Awal"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-slate-200 dark:border-slate-800">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Notifikasi
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      style={{ color: 'var(--theme-primary)' }}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {myNotifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400">
                      <CheckCircle2
                        className="w-8 h-8 mx-auto mb-2 opacity-80"
                        style={{ color: 'var(--theme-primary)' }}
                      />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">Tidak ada notifikasi</p>
                      <p className="text-[11px] mt-0.5">Semua tugas dan pemberitahuan telah Anda periksa.</p>
                    </div>
                  ) : (
                    myNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                          !notif.dibaca ? 'bg-slate-50/80 dark:bg-slate-800/40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`font-semibold text-xs line-clamp-1 ${
                              !notif.dibaca
                                ? 'font-bold text-slate-900 dark:text-white'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {notif.judul}
                          </span>
                          {!notif.dibaca && (
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: 'var(--theme-primary)' }}
                            ></span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {notif.pesan}
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
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
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.nama}
                className="w-8 h-8 rounded-full object-cover ring-2"
                style={{ borderColor: 'var(--theme-primary)' }}
              />
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[130px] truncate">
                  {currentUser.nama}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                  {currentUser.jabatan}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-slate-200 dark:border-slate-800">
                {/* Active user header info */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.nama}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">@{currentUser.username}</p>
                  </div>
                  {getRoleBadge(currentUser.role)}
                </div>

                {/* Self profile action & Logout */}
                <div className="p-1 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false);
                      onOpenProfileModal();
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                    <span>Profil Saya & Ganti Kata Sandi</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Keluar (Halaman Login)</span>
                    </button>
                  )}
                </div>

                {/* Role Switcher for 5 Demo Roles */}
                <div className="px-3 pt-2 pb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Beralih Peran Akun (5 Roles):
                  </p>
                </div>

                <div className="p-1 space-y-1 max-h-64 overflow-y-auto">
                  {allUsers.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          onUserChange(user);
                          setShowRoleMenu(false);
                        }}
                        style={
                          isSelected
                            ? {
                                backgroundColor: 'var(--theme-primary-light)',
                              }
                            : {}
                        }
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <img
                          src={user.avatar}
                          alt={user.nama}
                          className="w-7 h-7 rounded-full object-cover mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate flex items-center justify-between">
                            <span className={isSelected ? 'text-slate-900 dark:text-white' : ''}>
                              {user.nama}
                            </span>
                            {isSelected && (
                              <span
                                className="text-[10px] font-bold"
                                style={{ color: 'var(--theme-primary)' }}
                              >
                                Aktif
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {user.jabatan}
                          </div>
                          <div className="mt-1">{getRoleBadge(user.role)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
