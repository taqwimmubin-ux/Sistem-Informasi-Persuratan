import React from 'react';

interface BannerWatermarkLogoProps {
  customLogoUrl?: string;
  namaSekolah?: string;
  className?: string;
}

/**
 * Ilustrasi Watermark Garis (Line-Art) Bertema Surat-Menyurat untuk Banner Beranda
 * 
 * Komposisi:
 * - Amplop surat terbuka dengan lembaran surat menyembul dan garis teks dinas
 * - Pesawat kertas kecil yang terbang meluncur di atas amplop dengan jejak putus-putus
 * - Cap/stempel bundar lingkaran ganda bertanda centang persetujuan (approval stamp)
 * - Aksen bintang 4-ujung, bulan sabit mungil, dan titik dekoratif bernuansa Islami halus
 * - Animasi melayang lembut (floating) & pesawat kertas dinamis dengan prefers-reduced-motion support
 */
export const BannerWatermarkLogo: React.FC<BannerWatermarkLogoProps> = ({
  className = '',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`no-print pointer-events-none select-none absolute right-0 top-1/2 -translate-y-1/2 w-[60%] sm:w-[48%] md:w-[40%] lg:w-[36%] max-w-[420px] aspect-[4/3] flex items-center justify-end overflow-visible pr-2 sm:pr-4 md:pr-6 z-0 ${className}`}
    >
      <style>{`
        @keyframes bnyFloatWatermark {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-7px) rotate(0.6deg);
          }
        }
        @keyframes bnyFloatPlane {
          0%, 100% {
            transform: translate(0px, 0px) rotate(0deg);
          }
          50% {
            transform: translate(3px, -5px) rotate(1.5deg);
          }
        }
        @keyframes bnyTrailFlow {
          from {
            stroke-dashoffset: 24;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .bny-watermark-float {
          animation: bnyFloatWatermark 7s ease-in-out infinite;
          transform-origin: center center;
        }
        .bny-plane-float {
          animation: bnyFloatPlane 5s ease-in-out infinite;
          transform-origin: 310px 45px;
        }
        .bny-trail-flow {
          animation: bnyTrailFlow 8s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .bny-watermark-float,
          .bny-plane-float,
          .bny-trail-flow {
            animation: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 400 320"
        className="w-full h-full opacity-20 sm:opacity-25 transition-opacity duration-300 bny-watermark-float"
        fill="none"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient id="bnyPaperGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* ================================================================= */}
        {/* 1. JEJAK TERBANG PESAWAT KERTAS (Dashed Flight Trail)              */}
        {/* ================================================================= */}
        <path
          d="M 95 145 C 130 95, 175 115, 215 75 C 240 50, 275 42, 305 48"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="4 5"
          className="bny-trail-flow"
        />

        {/* ================================================================= */}
        {/* 2. LEMBARAN SURAT MENYEMBUL (Paper Sheet inside Envelope)          */}
        {/* ================================================================= */}
        <g>
          {/* Badan Kertas Surat dengan Sudut Lipat (Dog-ear) */}
          <path
            d="M 175 62 Q 175 52 185 52 L 285 52 L 305 72 L 305 185 L 175 185 Z"
            fill="url(#bnyPaperGlow)"
            stroke="white"
            strokeWidth="1.75"
          />
          {/* Garis Lipatan Sudut Kertas Surat */}
          <path d="M 285 52 L 285 72 L 305 72" stroke="white" strokeWidth="1.5" />

          {/* Garis-garis Isi Surat Dinas / Kaligrafi Formal */}
          <line x1="195" y1="72" x2="245" y2="72" strokeWidth="1.75" strokeOpacity="0.9" />
          <line x1="195" y1="88" x2="285" y2="88" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="195" y1="102" x2="275" y2="102" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="195" y1="116" x2="285" y2="116" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="195" y1="130" x2="255" y2="130" strokeWidth="1.5" strokeOpacity="0.8" />

          {/* Paraf / Tanda Tangan Ringkas pada Lembaran */}
          <path
            d="M 250 152 Q 260 145 268 150 Q 276 155 285 147"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.85"
          />
        </g>

        {/* ================================================================= */}
        {/* 3. BADAN AMPLOP TERBUKA (Open Envelope)                            */}
        {/* ================================================================= */}
        <g>
          {/* Flap Belakang Amplop Terbuka Menghadap Atas */}
          <path
            d="M 150 155 L 240 85 L 330 155"
            stroke="white"
            strokeWidth="1.75"
          />

          {/* Badan Bawah Amplop */}
          <path
            d="M 150 155 L 150 255 Q 150 268 163 268 L 317 268 Q 330 268 330 255 L 330 155 Z"
            fill="url(#bnyPaperGlow)"
            stroke="white"
            strokeWidth="1.85"
          />

          {/* Lipatan V Depan Amplop */}
          <path
            d="M 150 155 L 240 218 L 330 155"
            stroke="white"
            strokeWidth="1.75"
          />

          {/* Lipatan Sudut Kiri Bawah & Kanan Bawah */}
          <line x1="150" y1="262" x2="215" y2="200" strokeWidth="1.5" />
          <line x1="330" y1="262" x2="265" y2="200" strokeWidth="1.5" />
        </g>

        {/* ================================================================= */}
        {/* 4. PESAWAT KERTAS KECIL (Paper Airplane Floating)                  */}
        {/* ================================================================= */}
        <g className="bny-plane-float">
          {/* Badan Utama Sayap Pesawat Kertas */}
          <polygon
            points="340,32 270,58 298,75"
            stroke="white"
            strokeWidth="1.75"
            fill="url(#bnyPaperGlow)"
          />
          {/* Sayap Bawah & Lipatan Tengah */}
          <polygon
            points="340,32 298,75 288,88"
            stroke="white"
            strokeWidth="1.5"
          />
          <line x1="340" y1="32" x2="295" y2="70" strokeWidth="1.5" />
        </g>

        {/* ================================================================= */}
        {/* 5. CAP / STEMPEL BUNDAR PERSETUJUAN (Double-Ring Approval Stamp)   */}
        {/* ================================================================= */}
        <g transform="rotate(-6 115 220)">
          {/* Lingkaran Luar Stempel */}
          <circle cx="115" cy="220" r="38" stroke="white" strokeWidth="1.75" />
          {/* Lingkaran Dalam Stempel */}
          <circle cx="115" cy="220" r="31" stroke="white" strokeWidth="1.25" strokeDasharray="3 2" />

          {/* Tanda Centang Disetujui (Approved Checkmark) */}
          <path
            d="M 101 220 L 112 231 L 131 210"
            stroke="white"
            strokeWidth="2.25"
          />

          {/* Ornamen Bintang Kecil Kiri-Kanan Stempel */}
          <circle cx="94" cy="220" r="1.5" fill="white" />
          <circle cx="136" cy="220" r="1.5" fill="white" />

          {/* Lengkung Busur Teks Stempel */}
          <path d="M 96 206 C 105 200 125 200 134 206" strokeWidth="1.25" strokeOpacity="0.75" />
          <path d="M 96 234 C 105 240 125 240 134 234" strokeWidth="1.25" strokeOpacity="0.75" />
        </g>

        {/* ================================================================= */}
        {/* 6. AKSEN ISLAMI & DEKORASI BINTANG / BULAN SABIT                   */}
        {/* ================================================================= */}
        {/* Bulan Sabit Mungil di Kanan Atas */}
        <path
          d="M 368 70 C 357 70 348 79 348 90 C 348 101 357 110 368 110 C 361 106 357 99 357 90 C 357 81 361 74 368 70 Z"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Bintang 4-Ujung Mungil (Sparkle) */}
        <path
          d="M 374 54 Q 374 61 367 61 Q 374 61 374 68 Q 374 61 381 61 Q 374 61 374 54 Z"
          stroke="white"
          strokeWidth="1.25"
        />
        <path
          d="M 68 96 Q 68 103 61 103 Q 68 103 68 110 Q 68 103 75 103 Q 68 103 68 96 Z"
          stroke="white"
          strokeWidth="1.25"
        />
        <path
          d="M 165 288 Q 165 293 160 293 Q 165 293 165 298 Q 165 293 170 293 Q 165 293 165 288 Z"
          stroke="white"
          strokeWidth="1.25"
        />

        {/* Titik-titik Dekoratif Halus */}
        <circle cx="78" cy="140" r="1.5" fill="white" />
        <circle cx="145" cy="46" r="1.25" fill="white" />
        <circle cx="362" cy="145" r="1.5" fill="white" />
        <circle cx="320" cy="286" r="1.5" fill="white" />
        <circle cx="195" cy="28" r="1.2" fill="white" />
      </svg>
    </div>
  );
};

// Alias ekspor untuk fleksibilitas pemanggilan
export const BannerWatermarkIllustration = BannerWatermarkLogo;
export default BannerWatermarkLogo;
