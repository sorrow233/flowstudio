import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';

const FIELD_ORDER = [
    'lineHeight',
    'paragraphSpacing',
    'lineWidth',
    'firstLineIndent',
    'h1Size',
    'h2Size',
    'h3Size',
    'bodySize',
    'tableSize',
];

const FIELD_LABEL_MAP = {
    lineHeight: '行高',
    paragraphSpacing: '段间距',
    lineWidth: '行宽',
    firstLineIndent: '首行缩进',
    h1Size: '# 一级标题',
    h2Size: '## 二级标题',
    h3Size: '### 三级标题',
    bodySize: '正文',
    tableSize: '表格',
};

const FIELD_SUFFIX_MAP = {
    lineWidth: '（字符）',
};

const toFixedByStep = (value, step) => {
    if (!Number.isFinite(value)) return '';
    const hasDecimal = String(step).includes('.');
    if (!hasDecimal) return String(Math.round(value));

    const decimalLength = String(step).split('.')[1]?.length || 0;
    return value.toFixed(decimalLength);
};

const NumericFieldRow = ({
    field,
    value,
    limits,
    onValueChange,
}) => {
    const label = FIELD_LABEL_MAP[field] || field;
    const suffix = FIELD_SUFFIX_MAP[field] || '';

    return (
        <label className="grid grid-cols-[9.6rem_auto_1fr] items-center gap-3 text-[15px] leading-none text-slate-700 dark:text-slate-200">
            <span className="justify-self-end font-semibold tracking-tight">{label}:</span>
            <input
                type="number"
                value={toFixedByStep(value, limits.step)}
                min={limits.min}
                max={limits.max}
                step={limits.step}
                onChange={(event) => onValueChange(field, event.target.value)}
                className="h-11 w-[6.2rem] rounded-lg border border-slate-300 bg-white px-2 text-[1.08rem] text-slate-800 outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <span className="text-[12px] text-slate-400 dark:text-slate-500">{suffix}</span>
        </label>
    );
};

const WritingTypographyPanel = ({
    typography,
    fontOptions,
    fieldLimits,
    onValueChange,
    onReset,
    onClose,
    isMobile,
    t,
}) => (
    <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ type: 'spring', damping: 28, stiffness: 420 }}
        className={`mt-3 rounded-2xl border border-slate-300/70 bg-slate-100/95 px-4 py-4 text-slate-700 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 ${isMobile ? '' : 'ml-auto w-[25.5rem]'}`}
    >
        <div className="mb-4 flex items-center justify-between gap-2">
            <div className="text-[13px] font-semibold tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {t('writing.typography.panel', '排版设置')}
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onReset}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                    <RotateCcw size={12} />
                    {t('writing.typography.reset', '重置')}
                </button>
                <button
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    aria-label={t('common.close')}
                >
                    <X size={14} />
                </button>
            </div>
        </div>

        <div className="grid gap-3.5">
            <label className="grid grid-cols-[9.6rem_1fr] items-center gap-3 text-[15px] text-slate-700 dark:text-slate-200">
                <span className="justify-self-end font-semibold tracking-tight">{t('writing.typography.font', '字体')}:</span>
                <select
                    value={typography.fontId}
                    onChange={(event) => onValueChange('fontId', event.target.value)}
                    className="h-11 rounded-lg border border-slate-300 bg-white px-2 text-[1.02rem] text-slate-800 outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                    {fontOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </label>

            {FIELD_ORDER.map((field) => (
                <NumericFieldRow
                    key={field}
                    field={field}
                    value={typography[field]}
                    limits={fieldLimits[field]}
                    onValueChange={onValueChange}
                />
            ))}
        </div>
    </motion.div>
);

export default WritingTypographyPanel;
