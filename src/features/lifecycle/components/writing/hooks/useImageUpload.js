import { useState, useCallback } from 'react';
import { useAuth } from '../../../../auth/AuthContext';

/**
 * 转换图片为 WebP 格式（保持原尺寸）
 */
const compressImage = (file, quality = 0.86) => {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(url);
                    if (blob) {
                        const fileName = (file.name || 'image').replace(/\.[^.]+$/, '') + '.webp';
                        resolve(new File([blob], fileName, { type: 'image/webp' }));
                    } else {
                        reject(new Error('图片转换失败'));
                    }
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

export const useImageUpload = () => {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    const uploadImage = useCallback(async (file) => {
        if (!user?.uid) {
            throw new Error('请先登录');
        }

        if (!file || !file.type.startsWith('image/')) {
            throw new Error('请上传图片文件');
        }

        if (file.size > 15 * 1024 * 1024) {
            throw new Error('图片太大，请选择小于 15MB 的图片');
        }

        setIsUploading(true);

        try {
            const compressedFile = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressedFile);

            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.uid}`
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                let errorMsg = result.error || '上传失败';
                if (errorMsg.includes('whitelist')) {
                    errorMsg = '没有上传权限';
                } else if (errorMsg.includes('R2')) {
                    errorMsg = '存储服务异常，请稍后重试';
                }
                throw new Error(errorMsg);
            }

            return result.url;
        } finally {
            setIsUploading(false);
        }
    }, [user]);

    return {
        uploadImage,
        isUploading
    };
};
