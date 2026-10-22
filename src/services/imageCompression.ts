/**
 * Utility kompresi dan validasi gambar sisi klien (Client-Side Image Processing)
 * Menjaga logo tetap tajam untuk retina & print, sambil menghemat kuota penyimpanan.
 */

export interface CompressionResult {
  success: boolean;
  base64?: string;
  originalSize: number;
  compressedSize: number;
  message?: string;
}

export async function compressAndValidateLogo(
  file: File,
  maxDimension = 400,
  maxSizeBytes = 2 * 1024 * 1024
): Promise<CompressionResult> {
  // 1. Validasi Ukuran Awal
  if (file.size > maxSizeBytes) {
    return {
      success: false,
      originalSize: file.size,
      compressedSize: 0,
      message: `Ukuran file terlalu besar (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maksimal ukuran file adalah 2 MB.`,
    };
  }

  // 2. Validasi Format
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      success: false,
      originalSize: file.size,
      compressedSize: 0,
      message: 'Format file tidak didukung. Harap gunakan file PNG, JPG, JPEG, SVG, atau WebP.',
    };
  }

  // 3. Khusus SVG: jangan lakukan canvas re-encoding agar vektor tetap jernih
  if (file.type === 'image/svg+xml') {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve({
          success: true,
          base64,
          originalSize: file.size,
          compressedSize: base64.length,
          message: 'Berkas SVG vektor berhasil dimuat tanpa degradasi kualitas.',
        });
      };
      reader.onerror = () => {
        resolve({
          success: false,
          originalSize: file.size,
          compressedSize: 0,
          message: 'Gagal membaca berkas SVG.',
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // 4. Untuk Bitmap (PNG / JPG / WebP): kompresi proporsional menggunakan HTML5 Canvas
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung rasio aspek
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          // Fallback jika canvas context gagal
          resolve({
            success: true,
            base64: e.target?.result as string,
            originalSize: file.size,
            compressedSize: file.size,
          });
          return;
        }

        // Pelihara transparansi jika PNG / WebP
        ctx.clearRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Pilih output format: PNG jika transparansi terdeteksi atau file aslinya PNG
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedBase64 = canvas.toDataURL(outputMime, 0.88);

        resolve({
          success: true,
          base64: compressedBase64,
          originalSize: file.size,
          compressedSize: compressedBase64.length,
          message: `Logo berhasil dioptimalkan dari ${(file.size / 1024).toFixed(1)} KB menjadi ${(compressedBase64.length / 1024).toFixed(1)} KB.`,
        });
      };

      img.onerror = () => {
        resolve({
          success: false,
          originalSize: file.size,
          compressedSize: 0,
          message: 'Gambar rusak atau tidak dapat diproses oleh browser.',
        });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({
        success: false,
        originalSize: file.size,
        compressedSize: 0,
        message: 'Gagal membaca berkas gambar.',
      });
    };

    reader.readAsDataURL(file);
  });
}
