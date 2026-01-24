import React, { useState, useRef, useCallback } from 'react';
import { Image, X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../auth/AuthContext';

/**
 * 图片上传组件
 * 
 * 功能：
 * - 点击选择图片
 * - 拖拽上传
 * - 客户端图片压缩
 * - 上传进度显示
 * - 白名单权限检查（服务端验证）
 */
const ImageUploader = ({ onUploadComplete, disabled = false }) => {
    const { user } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    /**
     * 压缩图片到指定最大尺寸
     */
    const compressImage = useCallback((file, maxWidth = 1920, maxHeight = 1920, quality = 0.85) => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                let { width, height } = img;

                // 计算缩放比例
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }, []);

    /**
     * 上传图片到 R2
     */
    const uploadImage = useCallback(async (file) => {
        if (!user?.uid) {
            setError('请先登录');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // 压缩图片
            const compressedFile = await compressImage(file);

            // 构建 FormData
            const formData = new FormData();
            formData.append('file', compressedFile);

            // 发送上传请求
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.uid}`
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            // 回调通知上传成功
            onUploadComplete?.(result.url);

        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || '上传失败');
        } finally {
            setIsUploading(false);
        }
    }, [user, compressImage, onUploadComplete]);

    /**
     * 处理文件选择
     */
    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadImage(file);
        }
        // 重置 input 以便可以选择同一文件
        e.target.value = '';
    }, [uploadImage]);

    /**
     * 处理拖拽
     */
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            uploadImage(file);
        } else {
            setError('请上传图片文件');
        }
    }, [uploadImage]);

    /**
     * 点击按钮触发文件选择
     */
    const handleClick = useCallback(() => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    }, [disabled, isUploading]);

    return (
        <div className="relative">
            {/* 隐藏的文件输入 */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* 上传按钮 */}
            <button
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                disabled={disabled || isUploading}
                className={`
                    relative p-2 rounded-lg transition-all duration-300
                    ${isDragOver
                        ? 'bg-pink-100 dark:bg-pink-900/40 ring-2 ring-pink-400 scale-105'
                        : 'bg-gray-50/50 dark:bg-gray-800/50 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                    }
                    ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    border border-gray-100/50 dark:border-gray-700/50
                    hover:border-pink-200 dark:hover:border-pink-800
                    group
                `}
                title="上传图片"
            >
                {isUploading ? (
                    <Loader2 size={16} className="text-pink-500 animate-spin" />
                ) : (
                    <Image
                        size={16}
                        className={`
                            transition-colors
                            ${isDragOver
                                ? 'text-pink-500'
                                : 'text-gray-400 group-hover:text-pink-500'
                            }
                        `}
                    />
                )}
            </button>

            {/* 错误提示 */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute top-full left-0 mt-2 z-50 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-800 shadow-lg whitespace-nowrap"
                    >
                        <AlertCircle size={12} />
                        <span>{error}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setError(null);
                            }}
                            className="ml-1 p-0.5 hover:bg-red-100 dark:hover:bg-red-800/50 rounded"
                        >
                            <X size={10} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageUploader;
