import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Share2, Smartphone, X } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useIOSHomeScreenPrompt } from '../useIOSHomeScreenPrompt';

const cardMotion = {
    initial: { opacity: 0, y: -16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
};

const stepNumbers = ['01', '02', '03'];

const IOSHomeScreenPrompt = () => {
    const { t } = useTranslation();
    const {
        isReady,
        isIOS,
        isSafari,
        canShare,
        shouldShow,
        isGuideOpen,
        openGuide,
        closeGuide,
        openShareSheet,
        dismissPrompt,
    } = useIOSHomeScreenPrompt();

    if (!isReady || !isIOS || !shouldShow) {
        return null;
    }

    const primaryActionLabel = isSafari && canShare
        ? t('iosInstallPrompt.actions.openShare', '打开分享面板')
        : t('iosInstallPrompt.actions.showSteps', '查看步骤');

    const helperText = isSafari
        ? t('iosInstallPrompt.helperSafari', '点开系统分享面板后，选择“添加到主屏幕”即可。')
        : t('iosInstallPrompt.helperOtherBrowser', 'iOS 只能通过 Safari 完成“添加到主屏幕”，先看两步引导就行。');

    const guideSteps = isSafari
        ? [
            t('iosInstallPrompt.steps.safariOne', '点击下方“打开分享面板”，或直接点 Safari 的分享按钮。'),
            t('iosInstallPrompt.steps.safariTwo', '在系统菜单里找到“添加到主屏幕”。'),
            t('iosInstallPrompt.steps.safariThree', '确认名称后点“添加”，下次就能从桌面直接进入。'),
        ]
        : [
            t('iosInstallPrompt.steps.otherOne', '先在 Safari 中打开当前页面。'),
            t('iosInstallPrompt.steps.otherTwo', '点击 Safari 底部或顶部的分享按钮。'),
            t('iosInstallPrompt.steps.otherThree', '选择“添加到主屏幕”，再点“添加”。'),
        ];

    const handlePrimaryAction = async () => {
        if (isSafari && canShare) {
            await openShareSheet();
            return;
        }

        openGuide();
    };

    return (
        <>
            <motion.section
                {...cardMotion}
                className="mb-4 mt-2 overflow-hidden rounded-[28px] border border-pink-200/70 bg-gradient-to-br from-white via-pink-50 to-rose-100 px-4 py-4 text-slate-900 shadow-[0_18px_60px_rgba(244,114,182,0.14)] dark:border-pink-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/60 dark:text-slate-50"
            >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-pink-500 shadow-sm shadow-pink-200/70 dark:bg-white/10 dark:text-pink-300 dark:shadow-none">
                            <Smartphone size={20} strokeWidth={1.9} />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-sm font-semibold md:text-base">
                                    {t('iosInstallPrompt.title', '添加到桌面，更像原生 App')}
                                </h2>
                                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-pink-600 dark:bg-white/10 dark:text-pink-200">
                                    {isSafari
                                        ? t('iosInstallPrompt.badgeSafari', 'Safari 可直接操作')
                                        : t('iosInstallPrompt.badgeOtherBrowser', '请切到 Safari')}
                                </span>
                            </div>
                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                {isSafari
                                    ? t('iosInstallPrompt.descriptionSafari', 'iPhone 或 iPad 用户可以把 Flow Studio 放到主屏幕，下次一键打开。')
                                    : t('iosInstallPrompt.descriptionOtherBrowser', '当前不是 Safari，先看下步骤，切到 Safari 后就能添加到桌面。')}
                            </p>
                            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {helperText}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <button
                            type="button"
                            onClick={handlePrimaryAction}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black dark:bg-pink-300 dark:text-slate-950 dark:hover:bg-pink-200"
                        >
                            {isSafari && canShare ? <Share2 size={15} strokeWidth={1.9} /> : <Plus size={15} strokeWidth={1.9} />}
                            <span>{primaryActionLabel}</span>
                        </button>
                        <button
                            type="button"
                            onClick={dismissPrompt}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                        >
                            <X size={15} strokeWidth={1.9} />
                            <span>{t('iosInstallPrompt.actions.dismiss', '不再提示')}</span>
                        </button>
                    </div>
                </div>
            </motion.section>

            <AnimatePresence>
                {isGuideOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 px-4 pb-4 pt-10 backdrop-blur-sm md:items-center"
                        onClick={closeGuide}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.98 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            onClick={(event) => event.stopPropagation()}
                            className="w-full max-w-md rounded-[32px] border border-white/60 bg-white p-5 text-slate-900 shadow-[0_30px_90px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-900 dark:text-slate-50"
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-500 dark:text-pink-300">
                                        {t('iosInstallPrompt.guideEyebrow', '主屏安装指引')}
                                    </p>
                                    <h3 className="mt-2 text-lg font-semibold">
                                        {isSafari
                                            ? t('iosInstallPrompt.guideTitleSafari', '两步把 Flow Studio 放到桌面')
                                            : t('iosInstallPrompt.guideTitleOtherBrowser', '先切到 Safari，再添加到桌面')}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeGuide}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
                                    aria-label={t('common.close', '关闭')}
                                >
                                    <X size={16} strokeWidth={1.9} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {guideSteps.map((step, index) => (
                                    <div
                                        key={step}
                                        className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3 dark:bg-white/5"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-pink-500/12 text-xs font-semibold text-pink-600 dark:bg-pink-400/15 dark:text-pink-200">
                                            {stepNumbers[index]}
                                        </div>
                                        <p className="pt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                {isSafari && canShare && (
                                    <button
                                        type="button"
                                        onClick={openShareSheet}
                                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black dark:bg-pink-300 dark:text-slate-950 dark:hover:bg-pink-200"
                                    >
                                        <Share2 size={15} strokeWidth={1.9} />
                                        <span>{t('iosInstallPrompt.actions.openShare', '打开分享面板')}</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={dismissPrompt}
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                                >
                                    <span>{t('iosInstallPrompt.actions.dismiss', '不再提示')}</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default IOSHomeScreenPrompt;
