import React, { useMemo, useState } from 'react';
import { Copy, CheckCircle2, AlertCircle, UserRound } from 'lucide-react';
import { useAuth } from './AuthContext';

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

    const identityItems = useMemo(() => {
        if (!user) return [];
        return [
            { label: 'Firebase UID', value: user.uid || '' },
            { label: '邮箱', value: user.email || '未绑定邮箱' },
            { label: '显示名称', value: user.displayName || '未设置' },
            { label: '手机号', value: user.phoneNumber || '未绑定手机号' },
        ];
    }, [user]);

    const handleCopyUid = async () => {
        if (!user?.uid) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(user.uid);
            } else {
                const copied = fallbackCopy(user.uid);
                if (!copied) throw new Error('fallback copy failed');
            }
            setCopyStatus('success');
        } catch (error) {
            console.error('[UserIdentityPage] Copy UID failed:', error);
            setCopyStatus('error');
        } finally {
            window.setTimeout(() => setCopyStatus(''), 1800);
        }
    };

    if (!user) {
        return (
            <div className="h-full min-h-[70vh] flex items-center justify-center">
                <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg p-8">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">FlowStudio 账号信息</h1>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        当前未登录，无法显示账号 UID。请先在 FlowStudio 中登录账号，然后重新打开此页面。
                    </p>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        路由地址：<span className="font-mono">/__flowstudio/whoami</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full min-h-[70vh] flex items-center justify-center">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                        <UserRound className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">FlowStudio 账号信息</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">仅显示当前登录用户自己的账号标识信息</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {identityItems.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
                            <div className="text-xs tracking-wide text-gray-500 dark:text-gray-400 uppercase">{item.label}</div>
                            <div className="mt-1 font-mono text-sm md:text-base text-gray-900 dark:text-gray-100 break-all select-text">
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleCopyUid}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                    >
                        <Copy className="w-4 h-4" />
                        复制 UID
                    </button>

                    {copyStatus === 'success' && (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4" />
                            UID 已复制
                        </span>
                    )}

                    {copyStatus === 'error' && (
                        <span className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            复制失败，请手动选择复制
                        </span>
                    )}
                </div>

                <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                    路由地址：<span className="font-mono">/__flowstudio/whoami</span>
                </p>
            </div>
        </div>
    );
};

export default UserIdentityPage;
