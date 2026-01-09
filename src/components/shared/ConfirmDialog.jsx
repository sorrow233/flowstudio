import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * 现代化确认弹窗组件
 * 用于替代原生 confirm() 弹窗
 */
const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = '确认操作',
    message = '确定要执行此操作吗？',
    confirmText = '确认',
    cancelText = '取消',
    variant = 'danger', // 'danger' | 'warning' | 'info'
    icon: CustomIcon = null,
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-500',
            confirmBtn: 'bg-red-500 hover:bg-red-600 text-white',
            Icon: Trash2,
        },
        warning: {
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-500',
            confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white',
            Icon: AlertTriangle,
        },
        info: {
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-500',
            confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white',
            Icon: AlertTriangle,
        },
    };

    const styles = variantStyles[variant] || variantStyles.danger;
    const IconComponent = CustomIcon || styles.Icon;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Dialog */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                    >
                        <X size={16} />
                    </button>

                    {/* Content */}
                    <div className="p-6 pt-8 text-center">
                        {/* Icon */}
                        <div className={`mx-auto w-14 h-14 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
                            <IconComponent size={28} className={styles.iconColor} />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {title}
                        </h3>

                        {/* Message */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${styles.confirmBtn}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmDialog;

/**
 * 简化使用的 Hook
 */
export const useConfirmDialog = () => {
    const [dialogState, setDialogState] = React.useState({
        isOpen: false,
        title: '',
        message: '',
        variant: 'danger',
        onConfirm: () => { },
    });

    const openConfirm = (options) => {
        setDialogState({
            isOpen: true,
            title: options.title || '确认操作',
            message: options.message || '确定要执行此操作吗？',
            variant: options.variant || 'danger',
            confirmText: options.confirmText || '确认',
            cancelText: options.cancelText || '取消',
            onConfirm: options.onConfirm || (() => { }),
            icon: options.icon || null,
        });
    };

    const closeConfirm = () => {
        setDialogState(prev => ({ ...prev, isOpen: false }));
    };

    const ConfirmDialogComponent = () => (
        <ConfirmDialog
            isOpen={dialogState.isOpen}
            onClose={closeConfirm}
            onConfirm={dialogState.onConfirm}
            title={dialogState.title}
            message={dialogState.message}
            variant={dialogState.variant}
            confirmText={dialogState.confirmText}
            cancelText={dialogState.cancelText}
            icon={dialogState.icon}
        />
    );

    return { openConfirm, closeConfirm, ConfirmDialogComponent };
};
