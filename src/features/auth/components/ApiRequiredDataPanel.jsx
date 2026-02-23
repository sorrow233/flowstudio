import React from 'react';
import { AlertCircle, KeyRound, RefreshCw, Terminal } from 'lucide-react';
import IdentityFieldCard from './IdentityFieldCard';

const ApiRequiredDataPanel = ({
    requiredItems,
    tokenLoading = false,
    tokenError = '',
    onCopyItem,
    onRefreshToken,
    onCopyToken,
    onCopyCurl,
    onCopyFetch,
    copyStatus,
    copiedKey
}) => {
    return (
        <div className="mt-7 rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 text-[11px] tracking-wide uppercase text-gray-500 dark:text-gray-300">
                        <Terminal className="w-3.5 h-3.5" />
                        API 必备数据
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        本地调用待办 API 时，以下字段是必须或建议提供的参数。
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onRefreshToken}
                    disabled={tokenLoading}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 text-sm text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors disabled:opacity-60"
                    title="刷新 Firebase ID Token"
                >
                    <RefreshCw className={`w-4 h-4 ${tokenLoading ? 'animate-spin' : ''}`} />
                    {tokenLoading ? '刷新中...' : '刷新 Token'}
                </button>
            </div>

            {tokenError && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30">
                    <AlertCircle className="w-4 h-4" />
                    {tokenError}
                </div>
            )}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {requiredItems.map((item) => (
                    <IdentityFieldCard
                        key={item.key}
                        label={item.label}
                        value={item.value}
                        tone={item.tone || 'default'}
                        copyable
                        isCopied={copyStatus === 'success' && copiedKey === item.key}
                        onCopy={() => onCopyItem(item.value, item.key)}
                    />
                ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                    type="button"
                    onClick={onCopyToken}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm hover:opacity-90 transition-opacity"
                >
                    <KeyRound className="w-4 h-4" />
                    复制完整 ID Token
                </button>

                <button
                    type="button"
                    onClick={onCopyCurl}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 text-sm text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                    复制 cURL（可直接跑）
                </button>

                <button
                    type="button"
                    onClick={onCopyFetch}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 text-sm text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                    复制 Fetch 模板
                </button>
            </div>
        </div>
    );
};

export default ApiRequiredDataPanel;
