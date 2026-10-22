import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  whiteText?: boolean;
  customLogoUrl?: string;
  namaSekolah?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  whiteText = false,
  customLogoUrl,
  namaSekolah = 'SMPIT BUNAYYA',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className="flex items-center gap-3">
      {customLogoUrl ? (
        <div
          className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center rounded-xl overflow-hidden bg-white shadow-md p-1 border border-slate-200/80 dark:border-slate-700/80`}
        >
          <img
            src={customLogoUrl}
            alt={namaSekolah}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div
          className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center rounded-xl shadow-md text-amber-300 p-1 border border-white/20`}
          style={{
            background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-dark) 100%)',
          }}
        >
          {/* SVG Emblem for SMPIT Bunayya */}
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            {/* Shield Outline */}
            <path
              d="M50 5 L85 20 C85 60 50 90 50 95 C50 90 15 60 15 20 Z"
              fill="var(--theme-primary-dark, #064e3b)"
              stroke="#fbbf24"
              strokeWidth="3"
            />
            {/* Inner Golden Crescent */}
            <path
              d="M52 26 C43 27 36 34 36 43 C36 53 44 61 54 61 C58 61 62 59 65 56 C57 56 50 51 50 43 C50 36 54 30 60 27 C57 26 55 26 52 26 Z"
              fill="#f59e0b"
            />
            {/* Star */}
            <polygon
              points="63,33 65,39 71,39 66,43 68,49 63,45 58,49 60,43 55,39 61,39"
              fill="#fef08a"
            />
            {/* Open Book / Qur'an at base of crescent */}
            <path
              d="M50 63 C43 59 34 58 26 62 L26 73 C34 69 43 70 50 74 C57 70 66 69 74 73 L74 62 C66 58 57 59 50 63 Z"
              fill="#f8fafc"
              stroke="var(--theme-primary, #047857)"
              strokeWidth="1.5"
            />
            <line x1="50" y1="63" x2="50" y2="74" stroke="var(--theme-primary, #047857)" strokeWidth="1.5" />
          </svg>
        </div>
      )}

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold tracking-tight leading-none ${
                size === 'lg' ? 'text-xl' : size === 'xl' ? 'text-2xl' : 'text-base'
              } ${whiteText ? 'text-white' : 'text-slate-900 dark:text-white'}`}
            >
              {namaSekolah}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold border"
              style={{
                backgroundColor: 'var(--theme-primary-light)',
                color: 'var(--theme-primary-dark)',
                borderColor: 'var(--theme-primary)',
              }}
            >
              E-SURAT
            </span>
          </div>
          <span
            className={`text-[11px] leading-tight mt-0.5 ${
              whiteText ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Sistem Informasi Tata Usaha & Kearsipan
          </span>
        </div>
      )}
    </div>
  );
};
