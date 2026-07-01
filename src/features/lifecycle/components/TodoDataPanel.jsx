import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, Target, Zap } from 'lucide-react';
import Spotlight from '../../../components/shared/Spotlight';

const percentLabel = (value) => `${Math.round(value)}%`;

const TodoSegmentBar = ({ label, value, total, colorClass, trackClass }) => {
    const percent = total > 0 ? (value / total) * 100 : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-light text-gray-400 dark:text-gray-500">
                    {value.toLocaleString()} · {percentLabel(percent)}
                </span>
            </div>
            <div className={`h-2 overflow-hidden rounded-full ${trackClass}`}>
                <div
                    className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
                    style={{ width: `${Math.max(percent, value > 0 ? 4 : 0)}%` }}
                />
            </div>
        </div>
    );
};

const TodoRatioPill = ({ icon: Icon, label, value, hint, tone = 'blue' }) => {
    const toneClass = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-300',
        rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-300',
        violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-500 dark:text-violet-300',
    }[tone];

    return (
        <div className="flex items-start gap-3 border-b border-gray-100/80 py-3 last:border-b-0 dark:border-gray-800/80">
            <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
                <Icon size={16} />
            </div>
            <div className="min-w-0">
                <div className="text-xl font-light text-gray-700 dark:text-gray-200">{value}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</div>
                {hint && (
                    <div className="mt-1 text-[11px] font-light leading-relaxed text-gray-400 dark:text-gray-500">
                        {hint}
                    </div>
                )}
            </div>
        </div>
    );
};

const TodoDataPanel = ({ stats, variants }) => {
    if (!stats || stats.total === 0) return null;

    const conflictTotal = stats.conflict.major + stats.conflict.minor;
    const aiTotal = stats.ai.aiDone + stats.ai.aiInvolved + stats.ai.userDone;

    return (
        <motion.div variants={variants}>
            <Spotlight
                className="rounded-2xl transition-all duration-500 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-blue-100/50 dark:hover:shadow-blue-900/10 hover:scale-[1.01] active:scale-[0.99] group/card"
                spotColor="rgba(59, 130, 246, 0.08)"
            >
                <div className="p-6 md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-2.5 transition-transform duration-500 group-hover/card:scale-110 dark:from-blue-900/30 dark:to-blue-800/20">
                                    <CheckCircle2 className="h-5 w-5 text-blue-400" />
                                </div>
                                <span className="text-sm font-light uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                    待办系统
                                </span>
                            </div>
                            <div className="mb-5 text-5xl font-extralight tracking-tighter text-blue-500 dark:text-blue-400 md:text-7xl">
                                {stats.total.toLocaleString()}
                            </div>
                            <div className="flex flex-wrap items-center gap-7 text-xs font-light text-gray-400 dark:text-gray-500">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] uppercase tracking-widest opacity-70">未完成</span>
                                    <span className="text-sm font-medium text-blue-400">{stats.pending.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] uppercase tracking-widest opacity-70">完成率</span>
                                    <span className="text-sm font-medium text-emerald-400">{percentLabel(stats.completionRate)}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] uppercase tracking-widest opacity-70">本周新增</span>
                                    <span className="text-sm font-medium text-violet-400">{stats.thisWeekCreated.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid min-w-0 flex-1 gap-3 md:max-w-sm">
                            <TodoRatioPill
                                icon={CircleDashed}
                                label="今日新增"
                                value={stats.todayCreated.toLocaleString()}
                                hint={`当前未完成 ${stats.pending.toLocaleString()} 项`}
                            />
                            <TodoRatioPill
                                icon={Target}
                                label="主要矛盾占比"
                                value={percentLabel(stats.conflict.majorRatio)}
                                hint={`${stats.conflict.major.toLocaleString()} 项主要矛盾`}
                                tone="rose"
                            />
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-rose-400 dark:text-rose-300">
                                <Target size={13} />
                                主次矛盾结构
                            </div>
                            <TodoSegmentBar
                                label="主要矛盾"
                                value={stats.conflict.major}
                                total={conflictTotal}
                                colorClass="bg-rose-400 dark:bg-rose-500"
                                trackClass="bg-rose-50 dark:bg-rose-950/40"
                            />
                            <TodoSegmentBar
                                label="次要矛盾"
                                value={stats.conflict.minor}
                                total={conflictTotal}
                                colorClass="bg-violet-400 dark:bg-violet-500"
                                trackClass="bg-violet-50 dark:bg-violet-950/40"
                            />
                            {stats.conflict.unclassified > 0 && (
                                <div className="text-[11px] font-light text-gray-400 dark:text-gray-500">
                                    另有 {stats.conflict.unclassified.toLocaleString()} 项还没有主次矛盾标签。
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-sky-400 dark:text-sky-300">
                                <Zap size={13} />
                                AI 介入结构
                            </div>
                            <TodoSegmentBar
                                label="AI完成"
                                value={stats.ai.aiDone}
                                total={aiTotal}
                                colorClass="bg-emerald-400 dark:bg-emerald-500"
                                trackClass="bg-emerald-50 dark:bg-emerald-950/40"
                            />
                            <TodoSegmentBar
                                label="AI介入"
                                value={stats.ai.aiInvolved}
                                total={aiTotal}
                                colorClass="bg-sky-400 dark:bg-sky-500"
                                trackClass="bg-sky-50 dark:bg-sky-950/40"
                            />
                            <TodoSegmentBar
                                label="自己完成"
                                value={stats.ai.userDone}
                                total={aiTotal}
                                colorClass="bg-amber-400 dark:bg-amber-500"
                                trackClass="bg-amber-50 dark:bg-amber-950/40"
                            />
                        </div>
                    </div>
                </div>
            </Spotlight>
        </motion.div>
    );
};

export default TodoDataPanel;
