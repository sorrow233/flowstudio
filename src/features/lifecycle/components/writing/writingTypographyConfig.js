export const WRITING_TYPOGRAPHY_STORAGE_KEY = 'flow_writing_typography_v1';

export const WRITING_FONT_OPTIONS = [
    {
        id: 'lxgw',
        label: 'LXGW WenKai',
        stack: '"LXGW WenKai", "LXGW WenKai GB", "Source Han Serif SC", "Noto Serif SC", serif',
    },
    {
        id: 'source-serif',
        label: '思源宋体',
        stack: '"Source Han Serif SC", "Noto Serif SC", "Songti SC", Georgia, serif',
    },
    {
        id: 'source-sans',
        label: '思源黑体',
        stack: '"Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    },
    {
        id: 'songti',
        label: '宋体',
        stack: '"Songti SC", "STSong", "SimSun", serif',
    },
    {
        id: 'system',
        label: '系统默认',
        stack: '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    },
];

export const WRITING_TYPOGRAPHY_LIMITS = {
    lineHeight: { min: 1, max: 2.6, step: 0.05 },
    paragraphSpacing: { min: 0, max: 2, step: 0.1 },
    lineWidth: { min: 40, max: 100, step: 1 },
    firstLineIndent: { min: 0, max: 4, step: 0.25 },
    h1Size: { min: 18, max: 56, step: 1 },
    h2Size: { min: 16, max: 52, step: 1 },
    h3Size: { min: 15, max: 48, step: 1 },
    bodySize: { min: 14, max: 42, step: 1 },
    tableSize: { min: 12, max: 40, step: 1 },
};

export const WRITING_TYPOGRAPHY_DEFAULTS = {
    fontId: 'lxgw',
    lineHeight: 1.6,
    paragraphSpacing: 0,
    lineWidth: 64,
    firstLineIndent: 0,
    h1Size: 22,
    h2Size: 21,
    h3Size: 20,
    bodySize: 20,
    tableSize: 20,
};
