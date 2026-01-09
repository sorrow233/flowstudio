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
    title = 'Confirm',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger' | 'warning' | 'info'
    icon: CustomIcon = null,
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-500',
            confirmBtn: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30',
            Icon: Trash2,
            glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
            border: 'border-red-500/30'
        },
        warning: {
            iconBg: 'bg-amber-500/20',
            iconColor: 'text-amber-500',
            confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30',
            Icon: AlertTriangle,
            glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
            border: 'border-amber-500/30'
        },
        info: {
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-500',
            confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30',
            Icon: AlertTriangle,
            glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
            border: 'border-blue-500/30'
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
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                />

                {/* Dialog */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`relative w-full max-w-sm overflow-hidden rounded-3xl border backdrop-blur-xl shadow-2xl ${styles.border} bg-white/80 dark:bg-gray-900/80`}
                    style={{
                        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`
                    }}
                >
                    {/* Ambient Glow */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 ${styles.iconBg} opacity-40 blur-[50px] rounded-full pointer-events-none`} />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-10"
                    >
                        <X size={18} />
                    </button>

                    {/* Content */}
                    <div className="relative z-10 p-8 text-center flex flex-col items-center">
                        {/* Icon */}
                        <div className={`w-16 h-16 rounded-2xl ${styles.iconBg} flex items-center justify-center mb-6 ring-1 ring-white/10 ${styles.glow} backdrop-blur-sm`}>
                            <IconComponent size={32} className={styles.iconColor} strokeWidth={1.5} />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                            {title}
                        </h3>

                        {/* Message */}
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-[90%]">
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100/50 dark:border-white/5 flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/5"
                        >
                            {cancelText}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02, brightness: 1.1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirm}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all ${styles.confirmBtn}`}
                        >
                            {confirmText}
                        </motion.button>
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
            title: options.title || 'Confirm',
            message: options.message || 'Are you sure you want to proceed?',
            variant: options.variant || 'danger',
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
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
