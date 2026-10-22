import React from 'react';
import { SuratKeluar, ProfilSekolah } from '../../types';
import { Printer, X, ShieldCheck } from 'lucide-react';

interface TemplateSuratKeluarPrintProps {
  surat: SuratKeluar;
  sekolah: ProfilSekolah;
  onClose: () => void;
}

export const TemplateSuratKeluarPrint: React.FC<TemplateSuratKeluarPrintProps> = ({
  surat,
  sekolah,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Convert date to formal Indonesian style
  const dateObj = new Date(surat.tanggalSurat || Date.now());
  const indonesianDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[96vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* Top Control Bar */}
        <div className="no-print p-4 bg-slate-900 text-white rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">
              Pratinjau Surat Resmi Keluar Siap Cetak (A4)
            </span>
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

        {/* Printable Document Sheet */}
        <div className="p-8 sm:p-14 text-black bg-white font-serif leading-relaxed print-container text-[13px]">
          {/* KOP SURAT RESMI SEKOLAH */}
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
              <h1 className="text-xl font-extrabold uppercase tracking-tight text-emerald-950 print:text-black">
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

            <div className="w-20 shrink-0 text-center font-sans text-[10px] border border-black p-1 rounded">
              <span className="block font-bold">TERAKREDITASI</span>
              <span className="text-emerald-800 font-extrabold text-sm">A</span>
            </div>
          </div>
          {/* Double line divider */}
          <div className="border-b-4 border-black mb-8"></div>

          {/* Tanggal & Tempat (Kanan Atas) */}
          <div className="flex justify-between items-start font-sans text-xs mb-6">
            <div className="space-y-1">
              <div className="flex gap-2">
                <span className="w-20 font-semibold">Nomor</span>
                <span>: {surat.nomorSurat}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 font-semibold">Lampiran</span>
                <span>: {surat.lampiran?.length > 0 ? `${surat.lampiran.length} Berkas` : '-'}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-20 font-semibold">Perihal</span>
                <span className="font-bold">: {surat.perihal}</span>
              </div>
            </div>

            <div className="text-right">
              <p>Depok, {indonesianDate}</p>
            </div>
          </div>

          {/* Kepada Yth */}
          <div className="mb-6 font-sans text-xs">
            <p>Kepada Yth,</p>
            <p className="font-bold text-sm mt-0.5">{surat.tujuan}</p>
            <p className="text-slate-700">{surat.alamatTujuan || 'Di Tempat'}</p>
          </div>

          {/* Isi Surat */}
          <div className="space-y-4 text-justify whitespace-pre-line leading-relaxed font-serif">
            {surat.isiSurat || (
              <>
                <p>Assalamu’alaikum Warahmatullahi Wabarakatuh.</p>
                <p>
                  Segala puji dan syukur kita panjatkan ke hadirat Allah Subhanahu wa Ta’ala atas segala nikmat dan karunia-Nya. Shalawat serta salam senantiasa tercurahkan kepada junjungan alam Nabi Muhammad Shallallahu ‘Alaihi Wasallam, keluarga, para sahabat, dan pengikutnya hingga akhir zaman.
                </p>
                <p>
                  Sehubungan dengan perihal di atas, bersama ini kami sampaikan bahwa:
                </p>
                <p className="pl-4 italic">
                  "{surat.ringkasan}"
                </p>
                <p>
                  Demikian surat ini kami sampaikan, atas perhatian dan kerjasama yang baik kami haturkan terima kasih. Jazakumullahu khairan katsiran.
                </p>
                <p>Wassalamu’alaikum Warahmatullahi Wabarakatuh.</p>
              </>
            )}
          </div>

          {/* Bagian Tanda Tangan & Pengesahan */}
          <div className="mt-12 flex justify-between items-end font-sans text-xs">
            {/* QR Code Verifikasi Keaslian Surat Digital */}
            <div className="text-center p-2 border border-slate-300 rounded-xl max-w-[170px] bg-slate-50 print:bg-transparent">
              <div className="w-24 h-24 mx-auto bg-white border border-slate-300 p-1 flex items-center justify-center">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="0" y="0" width="30" height="30" fill="black" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" fill="black" />

                  <rect x="70" y="0" width="30" height="30" fill="black" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" fill="black" />

                  <rect x="0" y="70" width="30" height="30" fill="black" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" fill="black" />

                  <rect x="35" y="10" width="10" height="10" fill="black" />
                  <rect x="50" y="25" width="15" height="10" fill="black" />
                  <rect x="35" y="45" width="30" height="10" fill="black" />
                  <rect x="40" y="65" width="15" height="20" fill="black" />
                  <rect x="65" y="60" width="25" height="15" fill="black" />
                </svg>
              </div>
              <p className="text-[9px] text-slate-500 mt-1 font-mono">
                Scan untuk Verifikasi
              </p>
              <p className="text-[8px] text-emerald-800 font-bold">
                E-SURAT SMPIT BUNAYYA
              </p>
            </div>

            {/* Signature Block */}
            <div className="text-center w-72">
              <p>Kepala Sekolah,</p>
              <div className="h-24 flex items-center justify-center relative">
                {/* Stempel Sekolah & Tanda Tangan */}
                {surat.status === 'Disetujui' || surat.status === 'Terkirim' ? (
                  <>
                    {/* Stamp */}
                    <div className="absolute left-6 w-24 h-24 border-2 border-emerald-800/50 rounded-full flex items-center justify-center text-[10px] font-bold text-emerald-900/60 rotate-[-12deg] uppercase">
                      SMPIT BUNAYYA
                      <br />DEPOK
                    </div>
                    {/* Digital Signature */}
                    <div className="font-serif italic text-2xl text-slate-800 font-bold rotate-[-3deg] select-none">
                      {surat.penandatanganNama.split(' ')[0]}...
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 italic text-xs">
                    (Menunggu Persetujuan Kepala Sekolah)
                  </div>
                )}
              </div>
              <p className="font-bold underline text-sm">{surat.penandatanganNama}</p>
              <p className="text-[11px] text-slate-600">NIP. {surat.penandatanganNip || sekolah.nipKepalaSekolah}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
