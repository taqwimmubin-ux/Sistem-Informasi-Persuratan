import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { ThemeEngine } from './services/themeEngine';
import { AuthService } from './services/authService';
import {
  User,
  SuratMasuk,
  SuratKeluar,
  Disposisi,
  KategoriSurat,
  ProfilSekolah,
  LogAktivitas,
  Notifikasi,
  Prestasi,
} from './types';
import { ShieldAlert } from 'lucide-react';

// Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { SuratMasukList } from './components/surat-masuk/SuratMasukList';
import { SuratMasukFormModal } from './components/surat-masuk/SuratMasukFormModal';
import { SuratMasukDetailModal } from './components/surat-masuk/SuratMasukDetailModal';
import { DisposisiModal } from './components/disposisi/DisposisiModal';
import { LembarDisposisiPrint } from './components/disposisi/LembarDisposisiPrint';
import { DisposisiListView } from './components/disposisi/DisposisiListView';
import { SuratKeluarList } from './components/surat-keluar/SuratKeluarList';
import { SuratKeluarFormModal } from './components/surat-keluar/SuratKeluarFormModal';
import { SuratKeluarDetailModal } from './components/surat-keluar/SuratKeluarDetailModal';
import { TemplateSuratKeluarPrint } from './components/surat-keluar/TemplateSuratKeluarPrint';
import { LaporanView } from './components/laporan/LaporanView';
import { ProfilPrestasiView } from './components/prestasi/ProfilPrestasiView';
import { UserManagementView } from './components/admin/UserManagementView';
import { MasterDataView } from './components/admin/MasterDataView';
import { SchoolProfileView } from './components/admin/SchoolProfileView';
import { ActivityLogView } from './components/admin/ActivityLogView';
import { UserProfileModal } from './components/common/UserProfileModal';
import { LoginView } from './components/auth/LoginView';
import { ForceChangePasswordModal } from './components/auth/ForceChangePasswordModal';

const ADMIN_TABS = ['manajemen-user', 'master-data', 'pengaturan-sekolah', 'log-aktivitas'];

export default function App() {
  // Session check on initial app startup
  const initialSession = AuthService.validateSession();

  // App Shell & Session State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => initialSession.isValid);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(() =>
    initialSession.expired
      ? 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit. Silakan masuk kembali.'
      : null
  );

  // Global Data State
  const [currentUser, setCurrentUser] = useState<User>(
    () => initialSession.user || StorageService.getCurrentUser()
  );
  const [allUsers, setAllUsers] = useState<User[]>(() => StorageService.getUsers());
  const [sekolah, setSekolah] = useState<ProfilSekolah>(() => StorageService.getSekolah());
  const [kategoriList, setKategoriList] = useState<KategoriSurat[]>(() => StorageService.getKategori());
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>(() => StorageService.getSuratMasuk());
  const [suratKeluarList, setSuratKeluarList] = useState<SuratKeluar[]>(() => StorageService.getSuratKeluar());
  const [disposisiList, setDisposisiList] = useState<Disposisi[]>(() => StorageService.getDisposisi());
  const [prestasiList, setPrestasiList] = useState<Prestasi[]>(() => StorageService.getPrestasi());
  const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>(() => StorageService.getNotifikasi());
  const [logs, setLogs] = useState<LogAktivitas[]>(() => StorageService.getLogs());

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => ThemeEngine.getSavedTheme().isDark);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCreateSuratMasukOpen, setIsCreateSuratMasukOpen] = useState(false);
  const [editingSuratMasuk, setEditingSuratMasuk] = useState<SuratMasuk | null>(null);
  const [selectedSuratMasukForDetail, setSelectedSuratMasukForDetail] = useState<SuratMasuk | null>(null);
  const [selectedSuratForDisposisi, setSelectedSuratForDisposisi] = useState<SuratMasuk | null>(null);
  const [printDisposisiTarget, setPrintDisposisiTarget] = useState<{
    surat: SuratMasuk;
    disp?: Disposisi | null;
  } | null>(null);

  const [isCreateSuratKeluarOpen, setIsCreateSuratKeluarOpen] = useState(false);
  const [editingSuratKeluar, setEditingSuratKeluar] = useState<SuratKeluar | null>(null);
  const [selectedSuratKeluarForDetail, setSelectedSuratKeluarForDetail] = useState<SuratKeluar | null>(null);
  const [selectedSuratKeluarForPrint, setSelectedSuratKeluarForPrint] = useState<SuratKeluar | null>(null);

  // Initialize theme and load async assets from IndexedDB on startup
  useEffect(() => {
    const savedTheme = ThemeEngine.getSavedTheme();
    ThemeEngine.applyTheme(savedTheme);
    setIsDarkMode(savedTheme.isDark);

    // Asynchronous check for high-res logo in IndexedDB
    StorageService.loadSekolahAsync().then((loaded) => {
      setSekolah(loaded);
    });
  }, []);

  // Inactivity tracking (30 minutes timeout)
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleUserActivity = () => {
      AuthService.touchSession();
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) =>
      window.addEventListener(evt, handleUserActivity, { passive: true })
    );

    const intervalId = setInterval(() => {
      const sessionCheck = AuthService.validateSession();
      if (!sessionCheck.isValid) {
        AuthService.terminateSession();
        setIsLoggedIn(false);
        setSessionExpiredNotice(
          sessionCheck.expired
            ? 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit. Silakan masuk kembali.'
            : 'Sesi Anda telah berakhir. Silakan masuk kembali.'
        );
        StorageService.addLog(
          'LOGOUT',
          'Auth',
          `Sesi pengguna @${currentUser.username} (${currentUser.nama}) berakhir otomatis (inaktivitas 30 menit)`
        );
      }
    }, 15000);

    return () => {
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, handleUserActivity)
      );
      clearInterval(intervalId);
    };
  }, [isLoggedIn, currentUser]);

  // Unauthorized access attempt detection & audit logging
  useEffect(() => {
    if (isLoggedIn && ADMIN_TABS.includes(currentTab) && currentUser.role !== 'admin') {
      StorageService.addLog(
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        'Auth',
        `Percobaan akses tidak berwenang ke modul "${currentTab}" oleh pengguna @${currentUser.username} (${currentUser.nama} - Role: ${currentUser.role})`
      );
    }
  }, [currentTab, currentUser, isLoggedIn]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshAll = () => {
    setAllUsers(StorageService.getUsers());
    setSekolah(StorageService.getSekolah());
    setKategoriList(StorageService.getKategori());
    setSuratMasukList(StorageService.getSuratMasuk());
    setSuratKeluarList(StorageService.getSuratKeluar());
    setDisposisiList(StorageService.getDisposisi());
    setPrestasiList(StorageService.getPrestasi());
    setNotifikasiList(StorageService.getNotifikasi());
    setLogs(StorageService.getLogs());
    setCurrentUser(StorageService.getCurrentUser());
  };

  const handleToggleDarkMode = () => {
    const currentTheme = ThemeEngine.getSavedTheme();
    const updated = ThemeEngine.toggleDarkMode(currentTheme);
    setIsDarkMode(updated.isDark);
    showToast(updated.isDark ? 'Mode Gelap diaktifkan.' : 'Mode Terang diaktifkan.');
  };

  const handleLogout = (isAutoExpired = false) => {
    AuthService.terminateSession();
    StorageService.addLog(
      'LOGOUT',
      'Auth',
      isAutoExpired
        ? `Sesi berakhir otomatis (tidak aktif 30 menit): ${currentUser.nama}`
        : `Pengguna ${currentUser.nama} (${currentUser.role}) keluar dari sistem`
    );
    setIsLoggedIn(false);
    setSessionExpiredNotice(
      isAutoExpired
        ? 'Sesi Anda telah berakhir karena tidak ada aktivitas selama 30 menit. Silakan masuk kembali.'
        : null
    );
    showToast('Anda telah keluar dari sistem.');
  };

  const handleLoginSuccess = (user: User) => {
    setSessionExpiredNotice(null);
    setCurrentUser(user);
    setIsLoggedIn(true);
    refreshAll();
    showToast(`Selamat datang kembali, ${user.nama}!`);
  };

  const handleResetData = () => {
    StorageService.resetAllData();
    refreshAll();
    showToast('Data sistem telah di-reset ke kondisi awal master demo.');
  };

  // Surat Masuk Handlers
  const handleSavedSuratMasuk = (saved: SuratMasuk) => {
    refreshAll();
    showToast(`Surat Masuk No: ${saved.nomorSurat} berhasil disimpan.`);
  };

  const handleDeleteSuratMasuk = (id: string) => {
    const res = StorageService.deleteSuratMasuk(id);
    refreshAll();
    showToast(res.message);
  };

  const handleSavedDisposisi = (disp: Disposisi) => {
    refreshAll();
    showToast(`Lembar disposisi berhasil diterbitkan ke ${disp.tujuan.length} penerima.`);
  };

  // Surat Keluar Handlers
  const handleSavedSuratKeluar = (saved: SuratKeluar) => {
    refreshAll();
    showToast(`Surat Keluar No: ${saved.nomorSurat} berhasil disimpan.`);
  };

  const handleDeleteSuratKeluar = (id: string) => {
    const res = StorageService.deleteSuratKeluar(id);
    refreshAll();
    showToast(res.message);
  };

  // Mandatory Login Gate: If no active session, show Login screen
  if (!isLoggedIn) {
    return (
      <LoginView
        sekolah={sekolah}
        onLoginSuccess={handleLoginSuccess}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        sessionExpiredNotice={sessionExpiredNotice}
      />
    );
  }

  const isRestrictedTab = ADMIN_TABS.includes(currentTab) && currentUser.role !== 'admin';

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-from-bottom-3 border"
          style={{ borderColor: 'var(--theme-primary)' }}
        >
          <span
            className="w-2 h-2 rounded-full animate-ping shrink-0"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          ></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mandatory First-Time Password Change Modal */}
      <ForceChangePasswordModal
        isOpen={isLoggedIn && !!currentUser.mustChangePassword}
        currentUser={currentUser}
        onPasswordChanged={(updated) => {
          setCurrentUser(updated);
          refreshAll();
          showToast('Kata sandi personal Anda berhasil disimpan!');
        }}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        sekolah={sekolah}
        totalSuratMasuk={suratMasukList.length}
        totalSuratKeluar={suratKeluarList.length}
        disposisiList={disposisiList}
        suratKeluarList={suratKeluarList}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onUserChange={() => {}}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onResetData={handleResetData}
          allUsers={allUsers}
          notifikasiList={notifikasiList}
          onRefreshNotifikasi={refreshAll}
          onNavigate={(tab) => setCurrentTab(tab)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onLogout={() => handleLogout(false)}
        />

        {/* View Router - Only ONE single Beranda / Dashboard */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Unauthorized Access Denied Banner */}
          {isRestrictedTab ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-rose-200 dark:border-rose-900 shadow-sm text-center max-w-lg mx-auto my-12 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Akses Ditolak (Unauthorized)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Anda tidak memiliki wewenang untuk membuka modul konfigurasi atau manajemen sistem ini.
                Modul ini dikhususkan untuk Administrator Tata Usaha.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95"
                  style={{ backgroundColor: 'var(--theme-primary)' }}
                >
                  Kembali ke Dashboard Beranda
                </button>
              </div>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  currentUser={currentUser}
                  sekolah={sekolah}
                  suratMasukList={suratMasukList}
                  suratKeluarList={suratKeluarList}
                  disposisiList={disposisiList}
                  onNavigate={(tab) => setCurrentTab(tab)}
                  onOpenCreateSuratMasuk={() => {
                    setEditingSuratMasuk(null);
                    setIsCreateSuratMasukOpen(true);
                  }}
                  onOpenCreateSuratKeluar={() => {
                    setEditingSuratKeluar(null);
                    setIsCreateSuratKeluarOpen(true);
                  }}
                  onSelectSuratMasuk={(s) => setSelectedSuratMasukForDetail(s)}
                  onSelectSuratKeluar={(s) => setSelectedSuratKeluarForDetail(s)}
                />
              )}

              {currentTab === 'surat-masuk' && (
                <SuratMasukList
                  suratMasukList={suratMasukList}
                  kategoriList={kategoriList}
                  currentUser={currentUser}
                  disposisiList={disposisiList}
                  onOpenCreateModal={() => {
                    setEditingSuratMasuk(null);
                    setIsCreateSuratMasukOpen(true);
                  }}
                  onSelectSurat={(s) => setSelectedSuratMasukForDetail(s)}
                  onEditSurat={(s) => {
                    setEditingSuratMasuk(s);
                    setIsCreateSuratMasukOpen(true);
                  }}
                  onDeleteSurat={handleDeleteSuratMasuk}
                  onOpenDisposisiModal={(s) => setSelectedSuratForDisposisi(s)}
                  onOpenPrintDisposisi={(s, disp) =>
                    setPrintDisposisiTarget({ surat: s, disp })
                  }
                />
              )}

              {currentTab === 'disposisi-saya' && (
                <DisposisiListView
                  disposisiList={disposisiList}
                  suratMasukList={suratMasukList}
                  currentUser={currentUser}
                  onOpenPrintDisposisi={(s, disp) =>
                    setPrintDisposisiTarget({ surat: s, disp })
                  }
                  onRefresh={refreshAll}
                />
              )}

              {currentTab === 'surat-keluar' && (
                <SuratKeluarList
                  suratKeluarList={suratKeluarList}
                  kategoriList={kategoriList}
                  currentUser={currentUser}
                  onOpenCreateModal={() => {
                    setEditingSuratKeluar(null);
                    setIsCreateSuratKeluarOpen(true);
                  }}
                  onSelectSurat={(s) => setSelectedSuratKeluarForDetail(s)}
                  onEditSurat={(s) => {
                    setEditingSuratKeluar(s);
                    setIsCreateSuratKeluarOpen(true);
                  }}
                  onDeleteSurat={handleDeleteSuratKeluar}
                  onOpenPrint={(s) => setSelectedSuratKeluarForPrint(s)}
                />
              )}

              {currentTab === 'laporan' && (
                <LaporanView
                  suratMasukList={suratMasukList}
                  suratKeluarList={suratKeluarList}
                  kategoriList={kategoriList}
                  sekolah={sekolah}
                />
              )}

              {currentTab === 'profil-prestasi' && (
                <ProfilPrestasiView
                  prestasiList={prestasiList}
                  sekolah={sekolah}
                  currentUser={currentUser}
                  onRefresh={refreshAll}
                  onNavigateToSettings={() => setCurrentTab('pengaturan-sekolah')}
                />
              )}

              {currentTab === 'manajemen-user' && currentUser.role === 'admin' && (
                <UserManagementView
                  users={allUsers}
                  currentUser={currentUser}
                  onRefresh={refreshAll}
                />
              )}

              {currentTab === 'master-data' && currentUser.role === 'admin' && (
                <MasterDataView
                  kategoriList={kategoriList}
                  sekolah={sekolah}
                  onRefresh={refreshAll}
                />
              )}

              {currentTab === 'pengaturan-sekolah' && currentUser.role === 'admin' && (
                <SchoolProfileView
                  sekolah={sekolah}
                  onRefresh={refreshAll}
                  onThemeChanged={refreshAll}
                />
              )}

              {currentTab === 'log-aktivitas' && currentUser.role === 'admin' && (
                <ActivityLogView logs={logs} />
              )}
            </>
          )}
        </main>
      </div>

      {/* --- ALL MODALS --- */}

      {/* Self Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(updated) => {
          setCurrentUser(updated);
          refreshAll();
        }}
      />

      {/* Surat Masuk Add/Edit Modal */}
      <SuratMasukFormModal
        isOpen={isCreateSuratMasukOpen}
        onClose={() => {
          setIsCreateSuratMasukOpen(false);
          setEditingSuratMasuk(null);
        }}
        onSaved={handleSavedSuratMasuk}
        editData={editingSuratMasuk}
        kategoriList={kategoriList}
      />

      {/* Surat Masuk Detail Modal */}
      {selectedSuratMasukForDetail && (
        <SuratMasukDetailModal
          isOpen={true}
          onClose={() => setSelectedSuratMasukForDetail(null)}
          surat={selectedSuratMasukForDetail}
          disposisiList={disposisiList}
          currentUser={currentUser}
          onOpenDisposisiModal={(s) => {
            setSelectedSuratMasukForDetail(null);
            setSelectedSuratForDisposisi(s);
          }}
          onOpenPrintDisposisi={(s, disp) => {
            setPrintDisposisiTarget({ surat: s, disp });
          }}
          onEdit={(s) => {
            setEditingSuratMasuk(s);
            setIsCreateSuratMasukOpen(true);
          }}
          onDelete={handleDeleteSuratMasuk}
        />
      )}

      {/* Create Disposisi Modal */}
      {selectedSuratForDisposisi && (
        <DisposisiModal
          isOpen={true}
          onClose={() => setSelectedSuratForDisposisi(null)}
          surat={selectedSuratForDisposisi}
          allUsers={allUsers}
          currentUser={currentUser}
          onSaved={handleSavedDisposisi}
        />
      )}

      {/* Print Lembar Disposisi A4 */}
      {printDisposisiTarget && (
        <LembarDisposisiPrint
          surat={printDisposisiTarget.surat}
          disposisi={printDisposisiTarget.disp}
          sekolah={sekolah}
          onClose={() => setPrintDisposisiTarget(null)}
        />
      )}

      {/* Surat Keluar Add/Edit Modal */}
      <SuratKeluarFormModal
        isOpen={isCreateSuratKeluarOpen}
        onClose={() => {
          setIsCreateSuratKeluarOpen(false);
          setEditingSuratKeluar(null);
        }}
        onSaved={handleSavedSuratKeluar}
        editData={editingSuratKeluar}
        kategoriList={kategoriList}
      />

      {/* Surat Keluar Detail Modal */}
      {selectedSuratKeluarForDetail && (
        <SuratKeluarDetailModal
          isOpen={true}
          onClose={() => setSelectedSuratKeluarForDetail(null)}
          surat={selectedSuratKeluarForDetail}
          currentUser={currentUser}
          onOpenPrint={(s) => {
            setSelectedSuratKeluarForPrint(s);
          }}
          onEdit={(s) => {
            setEditingSuratKeluar(s);
            setIsCreateSuratKeluarOpen(true);
          }}
          onDelete={handleDeleteSuratKeluar}
          onRefresh={refreshAll}
        />
      )}

      {/* Print Template Surat Keluar Resmi Kop Sekolah */}
      {selectedSuratKeluarForPrint && (
        <TemplateSuratKeluarPrint
          surat={selectedSuratKeluarForPrint}
          sekolah={sekolah}
          onClose={() => setSelectedSuratKeluarForPrint(null)}
        />
      )}
    </div>
  );
}
