import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle2, AlertCircle, UserRound, Fingerprint, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from './AuthContext';
import IdentityFieldCard from './components/IdentityFieldCard';
import ApiRequiredDataPanel from './components/ApiRequiredDataPanel';

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

const parseFirebaseTokenPayload = (token) => {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    try {
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

const formatTimestamp = (unixSeconds) => {
    if (!Number.isInteger(unixSeconds) || unixSeconds <= 0) return '未知';
    return new Date(unixSeconds * 1000).toLocaleString('zh-CN', { hour12: false });
};

const buildTokenPreview = (token) => {
    if (!token) return '未获取';
    if (token.length <= 40) return token;
    return `${token.slice(0, 26)}...${token.slice(-18)}`;
};

const UserIdentityPage = () => {
    const { user } = useAuth();
    const [copyStatus, setCopyStatus] = useState('');
    const [copiedKey, setCopiedKey] = useState('');
    const [idToken, setIdToken] = useState('');
    const [refreshToken, setRefreshToken] = useState('');
    const [tokenPayload, setTokenPayload] = useState(null);
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

    const tokenPreview = useMemo(() => buildTokenPreview(idToken), [idToken]);
    const refreshTokenPreview = useMemo(() => buildTokenPreview(refreshToken), [refreshToken]);
    const tokenUserId = tokenPayload?.user_id || tokenPayload?.sub || '未知';
    const tokenAudience = tokenPayload?.aud || '未知';
    const tokenIssuedAt = formatTimestamp(tokenPayload?.iat);
    const tokenExpiresAt = formatTimestamp(tokenPayload?.exp);

    const curlCommand = useMemo(() => {
        if (!refreshToken) return '请先登录并等待 Refresh Token 注入后再调用。';
        return `curl -s \"https://flowstudio.catzz.work/api/todo?docId=flowstudio_v1&mode=unclassified&cursor=0&limit=50\" -H \"X-Firebase-Refresh-Token: ${refreshToken}\"`;
    }, [refreshToken]);

    const fetchTemplate = useMemo(() => {
        return `const refreshToken = auth.currentUser?.stsTokenManager?.refreshToken;\nconst res = await fetch('https://flowstudio.catzz.work/api/todo?docId=flowstudio_v1&mode=unclassified&cursor=0&limit=50', {\n  headers: { 'X-Firebase-Refresh-Token': refreshToken },\n});\nconst data = await res.json();\nconsole.log(data.numberedText);`;
    }, []);

    const apiBundleText = useMemo(() => {
        return [
            'API 必备数据',
            'API 地址: https://flowstudio.catzz.work/api/todo',
            '请求方法: GET',
            '长期认证头: X-Firebase-Refresh-Token: <Firebase Refresh Token>',
            '短期认证头: Authorization: Bearer <Firebase ID Token>',
            'docId（默认）: flowstudio_v1',
            'mode 可选值: unclassified | all | ai_done | ai_high | ai_mid | self',
            '分页参数: cursor=0, limit=1（逐条）；limit=50（批量）',
            `当前 Firebase UID: ${user?.uid || '未知'}`,
            `当前 ID Token（预览）: ${tokenPreview}`,
            `当前 Refresh Token（预览）: ${refreshTokenPreview}`,
            `Token 内 user_id: ${tokenUserId}`,
            `Token audience: ${tokenAudience}`,
            `Token 签发时间: ${tokenIssuedAt}`,
            `Token 过期时间: ${tokenExpiresAt}`,
            `当前完整 ID Token: ${idToken || '未获取'}`,
            `当前完整 Refresh Token: ${refreshToken || '未获取'}`,
            '',
            'cURL（长期调用）:',
            curlCommand,
            '',
            'Fetch 模板:',
            fetchTemplate
        ].join('\n');
    }, [
        curlCommand,
        fetchTemplate,
        idToken,
        refreshToken,
        refreshTokenPreview,
        tokenAudience,
        tokenExpiresAt,
        tokenIssuedAt,
        tokenPreview,
        tokenUserId,
        user?.uid
    ]);

    useEffect(() => {
        return () => {
            if (resetTimerRef.current) {
                window.clearTimeout(resetTimerRef.current);
            }
        };
    }, []);

    const loadIdToken = useCallback(async (forceRefresh = false) => {
        if (!user) return;

        try {
            const token = await user.getIdToken(forceRefresh);
            const longLivedRefreshToken = user?.stsTokenManager?.refreshToken || '';
            setIdToken(token || '');
            setRefreshToken(longLivedRefreshToken);
            setTokenPayload(parseFirebaseTokenPayload(token));
        } catch (error) {
            console.error('[UserIdentityPage] Failed to load Firebase token:', error);
            setIdToken('');
            setRefreshToken('');
            setTokenPayload(null);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        void loadIdToken(false);
    }, [loadIdToken, user]);

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
            <div className="relative min-h-[72vh] w-full overflow-hidden rounded-[32px]">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-violet-50 to-sky-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900" />
                <motion.div
                    aria-hidden
                    className="absolute -top-24 -left-12 h-72 w-72 rounded-full bg-pink-300/40 dark:bg-pink-500/20 blur-3xl"
                    animate={{ x: [0, 20, -8, 0], y: [0, -10, 14, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    aria-hidden
                    className="absolute -bottom-20 -right-10 h-80 w-80 rounded-full bg-sky-300/40 dark:bg-sky-500/20 blur-3xl"
                    animate={{ x: [0, -18, 10, 0], y: [0, 16, -8, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />

                <div className="relative z-10 h-full min-h-[72vh] flex items-center justify-center px-3">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-xl rounded-[30px] border border-white/60 dark:border-gray-700/70 bg-white/75 dark:bg-gray-900/70 backdrop-blur-xl shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)] p-7 md:p-9"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">FlowStudio 账号信息</h1>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            当前未登录，无法显示账号 UID。请先在 FlowStudio 中登录账号，再访问本页面。
                        </p>
                        <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100/90 dark:bg-gray-800/90 text-xs text-gray-600 dark:text-gray-300 font-mono">
                            路由：/__flowstudio/whoami
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[72vh] w-full overflow-hidden rounded-[32px]">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-indigo-50 to-sky-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900" />

            <motion.div
                aria-hidden
                className="absolute -top-24 -left-14 h-72 w-72 rounded-full bg-fuchsia-300/40 dark:bg-fuchsia-500/20 blur-3xl"
                animate={{ x: [0, 26, -10, 0], y: [0, -14, 10, 0] }}
                transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                aria-hidden
                className="absolute -bottom-24 right-[-30px] h-80 w-80 rounded-full bg-sky-300/40 dark:bg-sky-500/25 blur-3xl"
                animate={{ x: [0, -22, 12, 0], y: [0, 16, -8, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                aria-hidden
                className="absolute top-[36%] left-[46%] h-52 w-52 rounded-full bg-indigo-300/25 dark:bg-indigo-400/15 blur-3xl"
                animate={{ scale: [1, 1.08, 0.96, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 h-full min-h-[72vh] flex items-center justify-center px-3 py-6 md:px-4">
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full max-w-3xl rounded-[30px] border border-white/70 dark:border-gray-700/70 bg-white/72 dark:bg-gray-900/70 backdrop-blur-xl shadow-[0_28px_100px_-34px_rgba(15,23,42,0.4)] p-5 md:p-8"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <UserRound className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 text-[11px] tracking-wide uppercase text-gray-500 dark:text-gray-300">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    私密路由
                                </div>
                                <h1 className="mt-2 text-[1.7rem] leading-tight font-semibold text-gray-900 dark:text-gray-100">
                                    FlowStudio 账号信息
                                </h1>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    显示当前登录用户标识，用于绑定外部流程
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
                            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                            仅你可见
                        </div>
                    </div>

                    <div className="mt-6">
                        <IdentityFieldCard
                            label="Firebase UID"
                            value={user.uid || '暂无 UID'}
                            tone="uid"
                            hideValue
                            copyable
                            isCopied={copyStatus === 'success' && copiedKey === 'uid'}
                            onCopy={() => handleCopy(user.uid || '', 'uid')}
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {identityItems
                            .filter((item) => item.key !== 'uid')
                            .map((item) => (
                                <IdentityFieldCard
                                    key={item.label}
                                    label={item.label}
                                    value={item.value}
                                    hideValue
                                    copyable
                                    isCopied={copyStatus === 'success' && copiedKey === item.label}
                                    onCopy={() => handleCopy(item.value, item.label)}
                                />
                            ))}
                    </div>

                    <ApiRequiredDataPanel
                        onCopyBundle={() => handleCopy(apiBundleText, 'apiBundle')}
                        copyStatus={copyStatus}
                        copiedKey={copiedKey}
                    />

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => handleCopy(user.uid || '', 'uid')}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                        >
                            <Copy className="w-4 h-4" />
                            复制 UID
                        </button>

                        <div className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                            <Fingerprint className="w-4 h-4" />
                            可点击右侧图标复制任意字段
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {copyStatus === 'success' && (
                            <motion.div
                                key="copy-success"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                已复制到剪贴板
                            </motion.div>
                        )}

                        {copyStatus === 'error' && (
                            <motion.div
                                key="copy-error"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30"
                            >
                                <AlertCircle className="w-4 h-4" />
                                复制失败，请手动选择文本复制
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-6 pt-4 border-t border-gray-200/80 dark:border-gray-700/70">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-300 font-mono">
                            /__flowstudio/whoami
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default UserIdentityPage;
