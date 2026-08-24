export function compressImage(file, { maxWidth = 1600, maxHeight = 1600, quality = 0.8, type = 'image/jpeg' } = {}) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);

            let width = image.naturalWidth;
            let height = image.naturalHeight;

            // Resize hanya kalau melebihi ukuran maksimum
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);

                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');

            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');

            if (!context) {
                reject(new Error('Canvas tidak tersedia.'));
                return;
            }

            // Background putih supaya gambar JPEG tidak punya
            // background transparan.
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, width, height);

            context.drawImage(image, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Gagal melakukan compress gambar.'));
                        return;
                    }

                    const baseName = file.name.replace(/\.[^/.]+$/, '');

                    const compressedFile = new File([blob], `${baseName}.jpg`, {
                        type,
                        lastModified: Date.now(),
                    });

                    resolve(compressedFile);
                },
                type,
                quality,
            );
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);

            reject(new Error('File gambar tidak dapat dibaca.'));
        };

        image.src = objectUrl;
    });
}
