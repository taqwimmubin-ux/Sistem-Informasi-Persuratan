import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Calendar,
  UserCheck,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Edit,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { SuratKeluar, User } from '../../types';
import { StorageService } from '../../services/storage';

interface SuratKeluarDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratKeluar;
  currentUser: User;
  onOpenPrint: (surat: SuratKeluar) => void;
  onEdit: (surat: SuratKeluar) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export const SuratKeluarDetailModal: React.FC<SuratKeluarDetailModalProps> = ({
  isOpen,
  onClose,
  surat,
  currentUser,
  onOpenPrint,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [showApprovalBox, setShowApprovalBox] = useState(false);
  const [approvalDecision, setApprovalDecision] = useState<'Disetujui' | 'Ditolak'>('Disetujui');
  const [approvalNote, setApprovalNote] = useState('');

  if (!isOpen) return null;

  const handleProcessApproval = () => {
    StorageService.approveSuratKeluar(
      surat.id,
      approvalDecision,
      currentUser.nama,
      approvalNote
    );
    setShowApprovalBox(false);
    onRefresh();
    onClose();
  };

  const handleMarkAsSent = () => {
    StorageService.updateSuratKeluar(surat.id, { status: 'Terkirim' });
    onRefresh();
    onClose();
  };

  const getStatusBadge = (status: SuratKeluar['status']) => {
    switch (status) {
      case 'Disetujui':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Disetujui Kepala Sekolah
          </span>
        );
      case 'Menunggu Persetujuan':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Menunggu Persetujuan
          </span>
        );
      case 'Terkirim':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Send className="w-3.5 h-3.5 text-blue-600" /> Terkirim ke Tujuan
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Perlu Revisi / Ditolak
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileCheck2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-blue-200">
                {surat.nomorSurat}
              </span>
              <h2 className="text-base font-bold mt-1">Detail Dokumen Surat Keluar</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status & Approval Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Status Alur Persetujuan
              </span>
              <div className="mt-1">{getStatusBadge(surat.status)}</div>
            </div>

            {/* If Kepala Sekolah and pending approval, show Approve/Reject button */}
            {currentUser.role === 'kepala_sekolah' && surat.status === 'Menunggu Persetujuan' && !showApprovalBox && (
              <button
                onClick={() => setShowApprovalBox(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                Tindak Lanjut Persetujuan
              </button>
            )}

            {/* If Admin and status is approved, allow marking as Sent */}
            {currentUser.role === 'admin' && surat.status === 'Disetujui' && (
              <button
                onClick={handleMarkAsSent}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Tandai Sudah Terkirim
              </button>
            )}
          </div>

          {/* Interactive Approval Modal Form */}
          {showApprovalBox && (
            <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Form Persetujuan Kepala Sekolah
              </h4>
              <p className="text-xs text-amber-900">
                Pilih keputusan Anda untuk surat keluar No. <strong>{surat.nomorSurat}</strong>:
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalDecision('Disetujui')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    approvalDecision === 'Disetujui'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  ✓ Setujui & Sahkan
                </button>
                <button
                  type="button"
                  onClick={() => setApprovalDecision('Ditolak')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    approvalDecision === 'Ditolak'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  ✕ Tolak / Perlu Revisi
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                  Catatan Tambahan untuk Pembuat Surat (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 'Telah diperiksa dan disetujui, silakan dicap dinas dan didistribusikan.'"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowApprovalBox(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-amber-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleProcessApproval}
                  className="px-4 py-1.5 text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  Simpan Keputusan
                </button>
              </div>
            </div>
          )}

          {/* Core Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perihal</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {surat.perihal}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Tujuan Penerima:</span>
                <span className="font-bold text-slate-800 text-sm">{surat.tujuan}</span>
                <span className="text-[11px] text-slate-500 block">{surat.alamatTujuan}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Kategori & Sifat:</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                    {surat.kategori}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-800">
                    {surat.sifat}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Tanggal Surat:</span>
                <span className="font-semibold text-slate-800">{surat.tanggalSurat}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Penandatangan Resmi:</span>
                <span className="font-semibold text-slate-800">{surat.penandatanganNama}</span>
                <span className="text-[11px] text-slate-500 block">{surat.penandatanganJabatan}</span>
              </div>
            </div>

            {/* Approval info if available */}
            {surat.disetujuiOleh && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                <span className="font-bold block">Persetujuan Disahkan:</span>
                <p className="mt-0.5">
                  Disetujui oleh <strong>{surat.disetujuiOleh}</strong> pada {surat.tanggalPersetujuan}.
                </p>
                {surat.catatanPersetujuan && (
                  <p className="mt-1 italic text-emerald-800">"{surat.catatanPersetujuan}"</p>
                )}
              </div>
            )}

            {/* Isi Surat Preview */}
            <div className="pt-3 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Teks Lengkap Dokumen Surat:
              </span>
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line max-h-56 overflow-y-auto">
                {surat.isiSurat || surat.ringkasan}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => onOpenPrint(surat)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Cetak Surat Resmi (Kop Sekolah)
          </button>

          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(surat);
                  }}
                  className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Yakin ingin menghapus surat keluar no: ${surat.nomorSurat}?`)) {
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
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
