import React from 'react';
import { OFFICIAL_BUNAYYA_LOGO } from '../../assets/officialLogo';

export { OFFICIAL_BUNAYYA_LOGO };

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
  namaSekolah = 'Sekolah Model SMPIT BUNAYYA',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  // Gunakan logo kustom jika ada, atau gunakan Logo Resmi SMPIT Bunayya
  const effectiveLogoUrl =
    customLogoUrl &&
    customLogoUrl.trim() !== '' &&
    !customLogoUrl.includes('AP8AAADGCAMAAAAqo6ad')
      ? customLogoUrl
      : OFFICIAL_BUNAYYA_LOGO;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center rounded-2xl overflow-hidden bg-white shadow-md p-1 border border-slate-200/80 dark:border-white/10`}
      >
        <img
          src={effectiveLogoUrl}
          alt={namaSekolah}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== OFFICIAL_BUNAYYA_LOGO) {
              target.src = OFFICIAL_BUNAYYA_LOGO;
            }
          }}
        />
      </div>

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
