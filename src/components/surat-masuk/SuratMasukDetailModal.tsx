import React, { useState } from 'react';
import {
  X,
  FileText,
  Building,
  Calendar,
  Shield,
  Tag,
  Paperclip,
  Printer,
  Send,
  Edit,
  Trash2,
  Lock,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { SuratMasuk, Disposisi, User } from '../../types';

interface SuratMasukDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk;
  disposisiList: Disposisi[];
  currentUser: User;
  onOpenDisposisiModal: (surat: SuratMasuk) => void;
  onOpenPrintDisposisi: (surat: SuratMasuk, disp?: Disposisi | null) => void;
  onEdit: (surat: SuratMasuk) => void;
  onDelete: (id: string) => void;
}

export const SuratMasukDetailModal: React.FC<SuratMasukDetailModalProps> = ({
  isOpen,
  onClose,
  surat,
  disposisiList,
  currentUser,
  onOpenDisposisiModal,
  onOpenPrintDisposisi,
  onEdit,
  onDelete,
}) => {
  const [activePreviewFile, setActivePreviewFile] = useState<string | null>(null);

  if (!isOpen) return null;

  // Find dispositions for this letter
  const dispositions = disposisiList.filter((d) => d.suratMasukId === surat.id);
  const latestDisp = dispositions[0];

  // Confidentiality Check:
  // If Sifat is 'Rahasia', only Admin, Kepsek, or someone assigned in disposition can view full content.
  const isAssigned = latestDisp?.tujuan.some((t) => t.userId === currentUser.id);
  const isAuthorized =
    surat.sifat !== 'Rahasia' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'kepala_sekolah' ||
    isAssigned;

  const getSifatBadge = (sifat: SuratMasuk['sifat']) => {
    switch (sifat) {
      case 'Rahasia':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Rahasia</span>;
      case 'Segera':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">Segera</span>;
      case 'Penting':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">Penting</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">Biasa</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-emerald-200">
                {surat.nomorAgenda}
              </span>
              <h2 className="text-base font-bold mt-1">Detail Dokumen Surat Masuk</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Confidentiality Warning if restricted */}
          {!isAuthorized && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-3">
              <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Dokumen Bersifat RAHASIA</p>
                <p className="mt-0.5 text-rose-700">
                  Surat ini diklasifikasikan sebagai dokumen tertutup dan hanya dapat diakses secara penuh oleh Kepala Sekolah, Operator Tata Usaha, atau pejabat yang didisposisikan.
                </p>
              </div>
            </div>
          )}

          {/* Letter Main Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Sifat Surat:</span>
                {getSifatBadge(surat.sifat)}
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {surat.kategori}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Status Disposisi:{' '}
                <strong className={`font-bold ${surat.statusDisposisi === 'Selesai' ? 'text-emerald-700' : surat.statusDisposisi === 'Sudah Didisposisi' ? 'text-blue-700' : 'text-amber-700'}`}>
                  {surat.statusDisposisi}
                </strong>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perihal</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {surat.perihal}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Nomor Surat Asli:</span>
                <span className="font-mono font-semibold text-slate-800 text-sm">{surat.nomorSurat}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Asal Pengirim / Instansi:</span>
                <span className="font-semibold text-slate-800">{surat.pengirim}</span>
                {surat.alamatPengirim && (
                  <span className="text-[11px] text-slate-500 block">{surat.alamatPengirim}</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Tanggal Surat:</span>
                <span className="font-semibold text-slate-800">{surat.tanggalSurat}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Tanggal Diterima Sekolah:</span>
                <span className="font-semibold text-slate-800">{surat.tanggalDiterima}</span>
              </div>
            </div>

            {/* Summary */}
            <div className="pt-3 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Ringkasan / Poin Isi Surat:
              </span>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                {isAuthorized ? (
                  surat.ringkasan || 'Tidak ada ringkasan khusus yang dicatat.'
                ) : (
                  <span className="italic text-slate-400 filter blur-xs select-none">
                    Teks rahasia ini disembunyikan berdasarkan hak akses jabatan pengguna.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lampiran File */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-emerald-600" />
              Berkas Lampiran Fisik ({surat.lampiran?.length || 0})
            </h4>

            {(!surat.lampiran || surat.lampiran.length === 0) ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                Tidak ada berkas digital terlampir pada agenda ini.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {surat.lampiran.map((lamp) => (
                  <div
                    key={lamp.id}
                    className="p-3 bg-white border border-slate-200 hover:border-emerald-400 rounded-xl flex items-center justify-between text-xs transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">{lamp.namaFile}</p>
                        <p className="text-[10px] text-slate-400">{lamp.ukuran} • {lamp.tipe.toUpperCase()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        alert(`Simulasi membuka berkas kearsipan digital: "${lamp.namaFile}". Berkas tersimpan di repositori dokumen sekolah.`)
                      }
                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Pratinjau Berkas"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Riwayat Disposisi */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-600" />
                Riwayat & Lembar Disposisi ({dispositions.length})
              </h4>

              {(currentUser.role === 'admin' || currentUser.role === 'kepala_sekolah') && (
                <button
                  onClick={() => onOpenDisposisiModal(surat)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  + Buat Disposisi Baru
                </button>
              )}
            </div>

            {dispositions.length === 0 ? (
              <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-2xl text-center text-xs text-amber-800">
                <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                <p className="font-semibold">Surat Belum Didisposisikan</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Kepala Sekolah atau Tata Usaha belum menerbitkan instruksi disposisi untuk surat ini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dispositions.map((disp) => (
                  <div
                    key={disp.id}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] text-slate-400">Pemberi Instruksi:</span>
                        <p className="font-bold text-xs text-slate-900">{disp.pemberiDisposisiNama}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded text-[10px]">
                          Prioritas: {disp.prioritas}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Batas: <strong>{disp.batasWaktu}</strong>
                        </span>
                        <button
                          onClick={() => onOpenPrintDisposisi(surat, disp)}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          title="Cetak format fisik A4"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Cetak
                        </button>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">Instruksi Pimpinan:</p>
                      <ul className="mt-1 space-y-1">
                        {disp.instruksi.map((ins, idx) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>{ins}</span>
                          </li>
                        ))}
                      </ul>
                      {disp.catatanKhusus && (
                        <p className="mt-2 text-xs italic text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          "{disp.catatanKhusus}"
                        </p>
                      )}
                    </div>

                    {/* Assignees and status */}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                        Tindak Lanjut Penerima Disposisi:
                      </p>
                      <div className="space-y-2">
                        {disp.tujuan.map((t, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{t.nama}</span>
                              <span className="text-slate-500 text-[11px] block">{t.jabatan}</span>
                              {t.tanggapan && (
                                <p className="mt-1 text-[11px] text-emerald-900 bg-white p-1.5 rounded border border-emerald-100">
                                  💬 {t.tanggapan}
                                </p>
                              )}
                            </div>
                            <span
                              className={`self-start sm:self-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintDisposisi(surat, latestDisp)}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              Cetak Lembar Disposisi
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(surat);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus surat masuk no: ${surat.nomorSurat}?`)) {
                      onDelete(surat.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
