import React, { useState } from 'react';
import {
  X,
  Send,
  Calendar,
  AlertTriangle,
  UserCheck,
  CheckSquare,
  Square,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SuratMasuk, Disposisi, User, DisposisiTujuan } from '../../types';
import { StorageService } from '../../services/storage';

interface DisposisiModalProps {
  isOpen: boolean;
  onClose: () => void;
  surat: SuratMasuk;
  allUsers: User[];
  currentUser: User;
  onSaved: (disposisi: Disposisi) => void;
}

export const DisposisiModal: React.FC<DisposisiModalProps> = ({
  isOpen,
  onClose,
  surat,
  allUsers,
  currentUser,
  onSaved,
}) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [prioritas, setPrioritas] = useState<'Biasa' | 'Segera' | 'Sangat Segera'>('Segera');
  const [batasWaktu, setBatasWaktu] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([
    'Tindak lanjuti segera',
  ]);
  const [catatanKhusus, setCatatanKhusus] = useState('');
  const [customInstruction, setCustomInstruction] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Available standard instructions in Indonesian educational administration
  const standardInstructions = [
    'Tindak lanjuti segera',
    'Koordinasikan dengan pihak terkait',
    'Wakili hadir / disposisi pertemuan',
    'Pelajari & berikan telaah/masukan',
    'Siapkan bahan / materi / draft surat balasan',
    'Sosialisasikan kepada dewan guru / siswa',
    'Untuk diketahui & diarsipkan',
  ];

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleInstruction = (ins: string) => {
    setSelectedInstructions((prev) =>
      prev.includes(ins) ? prev.filter((i) => i !== ins) : [...prev, ins]
    );
  };

  const handleAddCustomInstruction = () => {
    if (customInstruction.trim() && !selectedInstructions.includes(customInstruction.trim())) {
      setSelectedInstructions((prev) => [...prev, customInstruction.trim()]);
      setCustomInstruction('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      setErrorMsg('Pilih minimal 1 pejabat / staf penerima disposisi.');
      return;
    }
    if (selectedInstructions.length === 0 && !catatanKhusus.trim()) {
      setErrorMsg('Berikan minimal satu instruksi atau catatan pimpinan.');
      return;
    }

    const tujuan: DisposisiTujuan[] = selectedUserIds.map((userId) => {
      const u = allUsers.find((user) => user.id === userId);
      return {
        userId,
        nama: u ? u.nama : 'Petugas',
        jabatan: u ? u.jabatan : 'Staf',
        status: 'Baru',
      };
    });

    const kepsek = allUsers.find((u) => u.role === 'kepala_sekolah');
    const pemberiId = currentUser.role === 'kepala_sekolah' ? currentUser.id : kepsek?.id || currentUser.id;
    const pemberiNama =
      currentUser.role === 'kepala_sekolah'
        ? currentUser.nama
        : `${kepsek?.nama || 'Kepala Sekolah'} (a.n. Tata Usaha)`;

    const newDisp = StorageService.addDisposisi({
      suratMasukId: surat.id,
      nomorSurat: surat.nomorSurat,
      perihal: surat.perihal,
      pemberiDisposisiId: pemberiId,
      pemberiDisposisiNama: pemberiNama,
      tanggalDisposisi: new Date().toISOString().split('T')[0],
      batasWaktu,
      prioritas,
      instruksi: selectedInstructions,
      catatanKhusus,
      tujuan,
      statusGlobal: 'Baru',
    });

    onSaved(newDisp);
    onClose();
  };

  // Filter possible targets (excluding Kepsek themselves usually)
  const eligibleRecipients = allUsers.filter((u) => u.id !== currentUser.id || currentUser.role === 'admin');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Send className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Buat Lembar Disposisi Surat</h2>
              <p className="text-xs text-emerald-100">
                Pemberian instruksi dinas Kepala SMPIT Bunayya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Letter Summary Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Nomor Surat: <strong className="text-slate-800 font-mono">{surat.nomorSurat}</strong></span>
              <span>Agenda: <strong className="text-emerald-700 font-mono">{surat.nomorAgenda}</strong></span>
            </div>
            <p className="font-bold text-slate-900 text-sm">{surat.perihal}</p>
            <p className="text-slate-600">Pengirim: {surat.pengirim}</p>
          </div>

          {/* Recipient Selection (Multi-select) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Diteruskan Kepada (Pilih Pejabat / Staf Terkait) *
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                {selectedUserIds.length} dipilih
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {eligibleRecipients.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => handleToggleUser(user.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <img
                      src={user.avatar}
                      alt={user.nama}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{user.nama}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.jabatan}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Sifat Prioritas Disposisi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Biasa', 'Segera', 'Sangat Segera'] as const).map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setPrioritas(pr)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                      prioritas === pr
                        ? pr === 'Sangat Segera'
                          ? 'bg-rose-600 text-white border-rose-600 font-bold'
                          : pr === 'Segera'
                          ? 'bg-amber-500 text-white border-amber-500 font-bold'
                          : 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Batas Waktu Penyelesaian
              </label>
              <input
                type="date"
                value={batasWaktu}
                onChange={(e) => setBatasWaktu(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Instructions Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              Petunjuk / Instruksi Tindak Lanjut *
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto p-1">
              {standardInstructions.map((ins, idx) => {
                const isChecked = selectedInstructions.includes(ins);
                return (
                  <label
                    key={idx}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleInstruction(ins)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>{ins}</span>
                  </label>
                );
              })}
            </div>

            {/* Custom Instruction Input */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Tambah instruksi khusus lainnya..."
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomInstruction();
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomInstruction}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Special Notes / Arahan Khusus */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Catatan Arahan Khusus Kepala Sekolah
            </label>
            <textarea
              rows={3}
              value={catatanKhusus}
              onChange={(e) => setCatatanKhusus(e.target.value)}
              placeholder="Contoh: 'Tolong koordinasikan dengan bagian sarpras untuk persiapan lab komputer dan laporkan hasilnya hari Kamis.'"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 focus:outline-none resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Kirim Lembar Disposisi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
