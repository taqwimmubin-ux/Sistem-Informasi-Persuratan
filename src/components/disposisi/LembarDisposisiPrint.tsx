import React from 'react';
import { SuratMasuk, Disposisi, ProfilSekolah } from '../../types';
import { Printer, X } from 'lucide-react';

interface LembarDisposisiPrintProps {
  surat: SuratMasuk;
  disposisi?: Disposisi | null;
  sekolah: ProfilSekolah;
  onClose: () => void;
}

export const LembarDisposisiPrint: React.FC<LembarDisposisiPrintProps> = ({
  surat,
  disposisi,
  sekolah,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print p-4 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Pratinjau Cetak Lembar Disposisi A4</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable A4 Sheet */}
        <div className="p-8 sm:p-12 text-black bg-white font-serif leading-normal print-container">
          {/* KOP SURAT RESMI */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-1 gap-4">
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              {sekolah.logoUrl ? (
                <img
                  src={sekolah.logoUrl}
                  alt={sekolah.namaSekolah}
                  className="w-20 h-20 object-contain"
                />
              ) : (
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <path
                    d="M50 5 L85 20 C85 60 50 90 50 95 C50 90 15 60 15 20 Z"
                    fill="#064e3b"
                    stroke="#000"
                    strokeWidth="2"
                  />
                  <path
                    d="M52 26 C43 27 36 34 36 43 C36 53 44 61 54 61 C58 61 62 59 65 56 C57 56 50 51 50 43 C50 36 54 30 60 27 Z"
                    fill="#fbbf24"
                  />
                  <polygon
                    points="63,33 65,39 71,39 66,43 68,49 63,45 58,49 60,43 55,39 61,39"
                    fill="#fff"
                  />
                  <path
                    d="M50 63 C43 59 34 58 26 62 L26 73 C34 69 43 70 50 74 C57 70 66 69 74 73 L74 62 C66 58 57 59 50 63 Z"
                    fill="#fff"
                    stroke="#000"
                    strokeWidth="1"
                  />
                </svg>
              )}
            </div>

            <div className="text-center flex-1 font-sans">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-slate-800">
                {sekolah.yayasan}
              </h3>
              <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-emerald-950 print:text-black">
                {sekolah.namaSekolah}
              </h1>
              <p className="text-[11px] font-medium text-slate-700">
                Status Akreditasi: <strong>{sekolah.akreditasi}</strong> | NPSN: {sekolah.npsn} | NSS: {sekolah.nss}
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5">
                {sekolah.alamat}, Kec. {sekolah.kecamatan}, {sekolah.kotaKabupaten}, {sekolah.provinsi} {sekolah.kodePos}
              </p>
              <p className="text-[10px] text-slate-600">
                Telp: {sekolah.telepon} • Email: {sekolah.email} • Web: {sekolah.website}
              </p>
            </div>

            <div className="w-20 shrink-0 text-center text-[10px] border border-black p-1 rounded font-sans">
              <span className="block font-bold">FORMAT DINAS</span>
              <span>A4 / PERSURATAN</span>
            </div>
          </div>
          {/* Garis ganda kop surat dinas */}
          <div className="border-b-4 border-black mb-6"></div>

          {/* JUDUL DOKUMEN */}
          <div className="text-center mb-6">
            <h2 className="text-base sm:text-lg font-bold tracking-wider underline uppercase">
              LEMBAR DISPOSISI SURAT
            </h2>
            <p className="text-xs font-sans text-slate-600 mt-0.5">
              Agenda Tata Usaha SMPIT Bunayya
            </p>
          </div>

          {/* TABEL DATA SURAT */}
          <table className="w-full border-collapse border border-black text-xs font-sans mb-4">
            <tbody>
              <tr>
                <td className="border border-black p-2 font-semibold bg-slate-100 w-1/4">
                  Nomor Agenda
                </td>
                <td className="border border-black p-2 font-mono font-bold w-1/4">
                  {surat.nomorAgenda}
                </td>
                <td className="border border-black p-2 font-semibold bg-slate-100 w-1/4">
                  Tingkat Keamanan
                </td>
                <td className="border border-black p-2 font-bold w-1/4">
                  <span className="uppercase">{surat.sifat}</span>
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-semibold bg-slate-100">
                  Tanggal Diterima
                </td>
                <td className="border border-black p-2">
                  {surat.tanggalDiterima}
                </td>
                <td className="border border-black p-2 font-semibold bg-slate-100">
                  Tanggal Surat
                </td>
                <td className="border border-black p-2">
                  {surat.tanggalSurat}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-semibold bg-slate-100">
                  Nomor Surat Asli
                </td>
                <td colSpan={3} className="border border-black p-2 font-mono font-medium">
                  {surat.nomorSurat}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-semibold bg-slate-100">
                  Asal / Pengirim
                </td>
                <td colSpan={3} className="border border-black p-2 font-semibold">
                  {surat.pengirim}
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-semibold bg-slate-100">
                  Perihal
                </td>
                <td colSpan={3} className="border border-black p-2 font-medium italic">
                  "{surat.perihal}"
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-semibold bg-slate-100">
                  Ringkasan Isi
                </td>
                <td colSpan={3} className="border border-black p-2 text-slate-800">
                  {surat.ringkasan || '-'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* ARAHAN & DISPOSISI */}
          <div className="border border-black text-xs font-sans mb-4">
            <div className="bg-slate-100 p-2 border-b border-black font-bold uppercase flex items-center justify-between">
              <span>Instruksi & Disposisi Kepala Sekolah</span>
              <span className="font-normal text-[11px]">
                Batas Waktu:{' '}
                <strong>{disposisi ? disposisi.batasWaktu : 'Segera'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 divide-x divide-black min-h-[160px]">
              {/* Kolom Diteruskan Kepada */}
              <div className="p-3">
                <p className="font-bold mb-2 underline">Diteruskan Kepada Yth:</p>
                {disposisi && disposisi.tujuan.length > 0 ? (
                  <ul className="space-y-1.5">
                    {disposisi.tujuan.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold">[✓]</span>
                        <div>
                          <div className="font-bold">{t.nama}</div>
                          <div className="text-[10px] text-slate-600">{t.jabatan}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-1 text-slate-500">
                    <div>[ ] Waka Kurikulum</div>
                    <div>[ ] Waka Kesiswaan</div>
                    <div>[ ] Waka Sarpras & IT</div>
                    <div>[ ] Kasubag Tata Usaha</div>
                    <div>[ ] Bendahara Sekolah</div>
                    <div>[ ] Dewan Guru / Wali Kelas</div>
                  </div>
                )}
              </div>

              {/* Kolom Petunjuk / Instruksi */}
              <div className="p-3">
                <p className="font-bold mb-2 underline">Instruksi / Disposisi:</p>
                {disposisi && disposisi.instruksi.length > 0 ? (
                  <ul className="space-y-1">
                    {disposisi.instruksi.map((ins, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="font-bold text-black">[✓]</span>
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-1 text-slate-500">
                    <div>[ ] Tindak lanjuti segera</div>
                    <div>[ ] Koordinasikan dengan pihak terkait</div>
                    <div>[ ] Wakili hadir / disposisi rapat</div>
                    <div>[ ] Pelajari & telaah</div>
                    <div>[ ] Siapkan bahan / draft jawaban</div>
                    <div>[ ] Untuk diketahui / diarsipkan</div>
                  </div>
                )}

                {/* Catatan Tambahan Pimpinan */}
                {disposisi?.catatanKhusus && (
                  <div className="mt-3 p-2 bg-slate-50 border border-slate-300 rounded text-[11px]">
                    <span className="font-bold block">Catatan Tambahan Kepala Sekolah:</span>
                    <p className="italic mt-0.5 font-serif text-slate-900">
                      "{disposisi.catatanKhusus}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KOLOM TANGGAPAN & TINDAK LANJUT PENERIMA */}
          <div className="border border-black text-xs font-sans mb-6">
            <div className="bg-slate-100 p-2 border-b border-black font-bold uppercase">
              Catatan Tindak Lanjut & Tanggapan Penerima Disposisi
            </div>
            <div className="p-3 min-h-[90px] text-slate-800">
              {disposisi?.tujuan.some((t) => t.tanggapan) ? (
                <div className="space-y-2">
                  {disposisi.tujuan
                    .filter((t) => t.tanggapan)
                    .map((t, idx) => (
                      <div key={idx} className="text-[11px] border-b border-slate-200 pb-1.5">
                        <strong className="text-slate-900">{t.nama} ({t.status}):</strong>
                        <p className="italic font-serif text-slate-800 mt-0.5">"{t.tanggapan}"</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-slate-400 italic text-[11px]">
                  (Kolom ini diisi hasil koordinasi atau laporan ringkas tindak lanjut oleh pejabat yang menerima disposisi)
                </p>
              )}
            </div>
          </div>

          {/* TANDA TANGAN KEPALA SEKOLAH */}
          <div className="flex justify-end font-sans text-xs mt-6">
            <div className="text-center w-64">
              <p>Depok, {disposisi?.tanggalDisposisi || surat.tanggalDiterima}</p>
              <p className="font-bold mt-1">Kepala SMPIT Bunayya,</p>
              <div className="h-20 flex items-center justify-center relative">
                {/* Simulated signature stamp */}
                <div className="w-24 h-16 border-2 border-emerald-800/40 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-900/60 rotate-[-8deg] uppercase tracking-tighter">
                  SMPIT BUNAYYA
                  <br />TERAKREDITASI
                </div>
              </div>
              <p className="font-bold underline text-sm">{sekolah.kepalaSekolah}</p>
              <p className="text-[11px] text-slate-700">NIP. {sekolah.nipKepalaSekolah}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
