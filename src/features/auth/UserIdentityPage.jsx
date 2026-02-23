import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle2, AlertCircle, UserRound, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthContext';
import IdentityFieldCard from './components/IdentityFieldCard';

const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
};

const UserIdentityPage = () => {
    const { user } = useAuth();
    const [copyStatus, setCopyStatus] = useState('');
    const [copiedKey, setCopiedKey] = useState('');
    const resetTimerRef = useRef(null);

    const identityItems = useMemo(() => {
        if (!user) return [];
        return [
            { key: 'uid', label: 'Firebase UID', value: user.uid || '' },
            { label: '邮箱', value: user.email || '未绑定邮箱' },
            { label: '显示名称', value: user.displayName || '未设置' },
            { label: '手机号', value: user.phoneNumber || '未绑定手机号' },
        ];
    }, [user]);

    useEffect(() => {
        return () => {
            if (resetTimerRef.current) {
                window.clearTimeout(resetTimerRef.current);
            }
        };
    }, []);

    const resetCopyHint = () => {
        if (resetTimerRef.current) {
            window.clearTimeout(resetTimerRef.current);
        }
        resetTimerRef.current = window.setTimeout(() => {
            setCopyStatus('');
            setCopiedKey('');
        }, 1800);
    };

    const handleCopy = async (value, key = 'uid') => {
        if (!value) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
                const copied = fallbackCopy(value);
                if (!copied) throw new Error('fallback copy failed');
            }
            setCopyStatus('success');
            setCopiedKey(key);
        } catch (error) {
            console.error('[UserIdentityPage] Copy UID failed:', error);
            setCopyStatus('error');
            setCopiedKey(key);
        } finally {
            resetCopyHint();
        }
    };

    if (!user) {
        return (
            <div className="relative min-h-[70vh] w-full overflow-hidden rounded-[24px] bg-gradient-to-b from-slate-50/70 to-slate-100/80 dark:from-slate-950/70 dark:to-slate-900/80">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#e2e8f033,transparent_58%)] dark:bg-[radial-gradient(circle_at_top,#47556944,transparent_62%)]" />
                <div className="relative z-10 min-h-[70vh] flex items-center justify-center p-4">
                    <motion.section
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-xl rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/90 dark:bg-gray-900/70 shadow-[0_18px_60px_-28px_rgba(15,23,42,0.45)] p-5 md:p-6"
                    >
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">FlowStudio 账号信息</h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            当前未登录，无法显示账号 UID。请先登录，再访问本页面。
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                            /__flowstudio/whoami
                        </div>
                    </motion.section>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[70vh] w-full overflow-hidden rounded-[24px] bg-gradient-to-b from-slate-50/65 to-slate-100/85 dark:from-slate-950/75 dark:to-slate-900/80">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#cbd5e133,transparent_56%)] dark:bg-[radial-gradient(circle_at_top,#33415544,transparent_62%)]" />
            <div className="relative z-10 min-h-[70vh] flex items-center justify-center p-3 md:p-5">
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="w-full max-w-2xl rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/88 dark:bg-gray-900/72 backdrop-blur-xl shadow-[0_22px_70px_-34px_rgba(15,23,42,0.45)] p-4 md:p-5"
                >
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 flex items-center justify-center shrink-0">
                                <UserRound className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-[1.05rem] md:text-[1.12rem] font-semibold text-gray-900 dark:text-gray-100 truncate">FlowStudio 账号信息</h1>
                                <p className="text-[12px] md:text-[12.5px] text-gray-600 dark:text-gray-300 truncate">当前登录账号的 UID 与绑定信息</p>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-gray-200/85 dark:border-gray-700/80 bg-slate-50/85 dark:bg-slate-800/65 text-[11px] text-slate-600 dark:text-slate-300 shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            私密
                        </div>
                    </div>

                    <div className="mt-4">
                        <IdentityFieldCard
                            label="Firebase UID"
                            value={user.uid || '暂无 UID'}
                            tone="uid"
                            copyable
                            isCopied={copyStatus === 'success' && copiedKey === 'uid'}
                            onCopy={() => handleCopy(user.uid || '', 'uid')}
                        />
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {identityItems
                            .filter((item) => item.key !== 'uid')
                            .map((item) => (
                                <IdentityFieldCard
                                    key={item.label}
                                    label={item.label}
                                    value={item.value}
                                    copyable
                                    isCopied={copyStatus === 'success' && copiedKey === item.label}
                                    onCopy={() => handleCopy(item.value, item.label)}
                                />
                            ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => handleCopy(user.uid || '', 'uid')}
                            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition-opacity text-sm"
                        >
                            <Copy className="w-[14px] h-[14px]" />
                            复制 UID
                        </button>

                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100/90 dark:bg-slate-800/70 text-xs text-slate-600 dark:text-slate-300 font-mono">
                            /__flowstudio/whoami
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {copyStatus === 'success' && (
                            <motion.div
                                key="copy-success"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                已复制到剪贴板
                            </motion.div>
                        )}

                        {copyStatus === 'error' && (
                            <motion.div
                                key="copy-error"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30"
                            >
                                <AlertCircle className="w-3.5 h-3.5" />
                                复制失败，请手动选择文本复制
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.section>
            </div>
        </div>
    );
};

export default UserIdentityPage;
