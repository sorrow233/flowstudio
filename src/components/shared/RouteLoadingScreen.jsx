import React from 'react';

const RouteLoadingScreen = () => {
    const loadingRows = ['w-full', 'w-[82%]', 'w-[68%]'];

    return (
        <div className="relative flex min-h-[48vh] w-full items-center justify-center overflow-hidden px-6 py-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.16),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.42),rgba(15,23,42,0))]" />
            <div className="absolute -left-12 top-10 h-36 w-36 rounded-full bg-rose-200/35 blur-3xl dark:bg-rose-500/12" />
            <div className="absolute -right-10 bottom-6 h-40 w-40 rounded-full bg-orange-100/45 blur-3xl dark:bg-orange-400/10" />

            <div
                role="status"
                aria-live="polite"
                aria-busy="true"
                className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-7 shadow-[0_32px_90px_-40px_rgba(244,63,94,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_32px_90px_-40px_rgba(15,23,42,0.92)]"
            >
                <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/80 to-transparent dark:via-rose-400/30" />

                <div className="flex items-start gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                        <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-rose-200/90 via-white to-orange-100/80 dark:from-rose-500/18 dark:via-slate-900 dark:to-orange-400/10" />
                        <div className="absolute inset-[6px] rounded-[18px] border border-white/80 dark:border-white/10" />
                        <div className="absolute h-10 w-10 rounded-full border-2 border-rose-500/20 border-r-orange-300/70 border-t-rose-500/90 animate-[spin_2.4s_linear_infinite] motion-reduce:animate-none" />
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_0_10px_rgba(251,113,133,0.14)] dark:bg-rose-300 dark:shadow-[0_0_0_10px_rgba(244,63,94,0.18)]" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="inline-flex items-center gap-2 rounded-full bg-rose-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:bg-white/5 dark:text-slate-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse motion-reduce:animate-none" />
                            Flow Studio
                        </div>
                        <h2 className="mt-3 text-[22px] font-semibold tracking-[0.01em] text-slate-800 dark:text-slate-100">
                            正在准备你的工作台
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            整理灵感、写作与同步状态，只需要片刻。
                        </p>
                    </div>
                </div>

                <div className="mt-6 rounded-[22px] border border-slate-100/80 bg-white/65 p-4 dark:border-white/5 dark:bg-white/[0.03]">
                    <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                        <span>Loading View</span>
                        <span>Syncing</span>
                    </div>
                    <div className="mt-4 space-y-3">
                        {loadingRows.map((rowWidth, index) => (
                            <div
                                key={rowWidth}
                                className={`h-2.5 rounded-full bg-gradient-to-r from-rose-100 via-orange-50 to-transparent dark:from-rose-400/20 dark:via-orange-300/10 dark:to-transparent ${rowWidth} animate-pulse motion-reduce:animate-none`}
                                style={{ animationDelay: `${index * 180}ms` }}
                            />
                        ))}
                    </div>
                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-rose-500 via-orange-400 to-rose-300 animate-[pulse_1.8s_ease-in-out_infinite] motion-reduce:animate-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteLoadingScreen;
