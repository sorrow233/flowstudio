export const MAX_COMPRESSED_SOURCE_IMAGE_SIZE = 15 * 1024 * 1024;
export const MAX_DIRECT_UPLOAD_IMAGE_SIZE = 10 * 1024 * 1024;

const IMAGE_EXTENSION_BY_TYPE = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
};

const ensureUploadImageFileName = (file, fallbackName = 'image') => {
    if (/\.[a-z0-9]+$/i.test(file.name || '')) return file;

    const extension = IMAGE_EXTENSION_BY_TYPE[file.type] || 'jpg';
    return new File([file], `${fallbackName}.${extension}`, {
        type: file.type,
        lastModified: file.lastModified,
    });
};

export const validateImageFileForUpload = (file, { compressToWebp = true } = {}) => {
    if (!file || !file.type?.startsWith('image/')) {
        throw new Error('请上传图片文件');
    }

    const maxSize = compressToWebp
        ? MAX_COMPRESSED_SOURCE_IMAGE_SIZE
        : MAX_DIRECT_UPLOAD_IMAGE_SIZE;

    if (file.size > maxSize) {
        throw new Error(
            compressToWebp
                ? '图片太大，请选择小于 15MB 的图片'
                : '原图上传不能超过 10MB，请开启 WebP 压缩或选择更小的图片'
        );
    }
};

export const compressImageToWebp = (file, quality = 0.86, fallbackName = 'image') => {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('图片转换失败'));
                return;
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(url);
                    if (!blob) {
                        reject(new Error('图片转换失败'));
                        return;
                    }

                    const fileName = (file.name || fallbackName).replace(/\.[^.]+$/, '') + '.webp';
                    resolve(new File([blob], fileName, { type: 'image/webp' }));
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('图片加载失败'));
        };

        img.src = url;
    });
};

export const prepareImageFileForUpload = async (
    file,
    { compressToWebp = true, fallbackName = 'image' } = {}
) => {
    validateImageFileForUpload(file, { compressToWebp });
    if (!compressToWebp) return ensureUploadImageFileName(file, fallbackName);
    return compressImageToWebp(file, 0.86, fallbackName);
};
