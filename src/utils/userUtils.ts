import { User, JenisKelamin } from '../types';

/**
 * Menghapus awalan Ustadz / Ustadzah / Ust. / Ustdh. dari nama pengguna
 * untuk memastikan nama di data tersimpan bersih tanpa awalan ganda.
 */
export function bersihkanNama(nama?: string): string {
  if (!nama) return '';
  return nama
    .trim()
    .replace(/^(Ustadzah|Ustadz|Ust\.|Ustdh\.)\s+/i, '')
    .trim();
}

/**
 * Format nama lengkap pengguna dengan sapaan kehormatan otomatis sesuai jenis kelamin:
 * - Laki-laki: "Ustadz [Nama Lengkap + Gelar]"
 * - Perempuan: "Ustadzah [Nama Lengkap + Gelar]"
 *
 * Selalu membersihkan awalan lama terlebih dahulu agar tidak dobel.
 */
export function formatNamaPanggilan(
  user?: Partial<User> | { nama?: string; jenisKelamin?: JenisKelamin | string } | null,
  withPrefix: boolean = true
): string {
  if (!user || !user.nama) return '';
  const clean = bersihkanNama(user.nama);
  if (!withPrefix) return clean;

  const isPerempuan =
    user.jenisKelamin === 'Perempuan' ||
    (typeof user.nama === 'string' && /^(Ustadzah|Ustdh\.)/i.test(user.nama));

  const prefix = isPerempuan ? 'Ustadzah' : 'Ustadz';
  return `${prefix} ${clean}`;
}
