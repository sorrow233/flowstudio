import { useState, useCallback } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { useSettings } from '../../../../../hooks/SettingsContext';
import { prepareImageFileForUpload } from '../../../services/imageUploadUtils';

export const useImageUpload = () => {
    const { user } = useAuth();
    const { compressImagesToWebp } = useSettings();
    const [isUploading, setIsUploading] = useState(false);

    const uploadImage = useCallback(async (file) => {
        if (!user?.uid) {
            throw new Error('请先登录');
        }

        setIsUploading(true);

        try {
            const uploadFile = await prepareImageFileForUpload(file, {
                compressToWebp: compressImagesToWebp,
            });
            const formData = new FormData();
            formData.append('file', uploadFile);

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
    }, [compressImagesToWebp, user]);

    return {
        uploadImage,
        isUploading
    };
};
