export const WRITING_HIGHLIGHT_COLORS = [
    {
        id: 'pale-pink',
        dot: 'bg-[#FFD6E7]',
        highlight: 'rgba(255, 214, 231, 0.45)',
        glow: 'group-hover:ring-[#FFD6E7]/30 group-hover:shadow-[0_0_20px_rgba(255,214,231,0.28)]',
        border: 'hover:border-[#FFD6E7] dark:hover:border-[#FFD6E7]/50',
    },
    {
        id: 'light-red',
        dot: 'bg-[#FFC9A9]',
        highlight: 'rgba(255, 201, 169, 0.45)',
        glow: 'group-hover:ring-[#FFC9A9]/30 group-hover:shadow-[0_0_20px_rgba(255,201,169,0.28)]',
        border: 'hover:border-[#FFC9A9] dark:hover:border-[#FFC9A9]/50',
    },
    {
        id: 'salmon',
        dot: 'bg-[#FFE699]',
        highlight: 'rgba(255, 230, 153, 0.5)',
        glow: 'group-hover:ring-[#FFE699]/30 group-hover:shadow-[0_0_20px_rgba(255,230,153,0.28)]',
        border: 'hover:border-[#FFE699] dark:hover:border-[#FFE699]/50',
    },
    {
        id: 'violet',
        dot: 'bg-[#C7B8FF]',
        highlight: 'rgba(199, 184, 255, 0.45)',
        glow: 'group-hover:ring-[#C7B8FF]/30 group-hover:shadow-[0_0_20px_rgba(199,184,255,0.28)]',
        border: 'hover:border-[#C7B8FF] dark:hover:border-[#C7B8FF]/50',
    },
    {
        id: 'pale-green',
        dot: 'bg-[#BEECCB]',
        highlight: 'rgba(190, 236, 203, 0.45)',
        glow: 'group-hover:ring-[#BEECCB]/30 group-hover:shadow-[0_0_20px_rgba(190,236,203,0.28)]',
        border: 'hover:border-[#BEECCB] dark:hover:border-[#BEECCB]/50',
    },
    {
        id: 'sky-blue',
        dot: 'bg-[#B9E3FF]',
        highlight: 'rgba(185, 227, 255, 0.48)',
        glow: 'group-hover:ring-[#B9E3FF]/30 group-hover:shadow-[0_0_20px_rgba(185,227,255,0.28)]',
        border: 'hover:border-[#B9E3FF] dark:hover:border-[#B9E3FF]/50',
    },
];

export const findWritingHighlightColor = (colorId) =>
    WRITING_HIGHLIGHT_COLORS.find((color) => color.id === colorId);
