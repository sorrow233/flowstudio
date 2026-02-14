import { useEffect, useState } from 'react';

export const useFloatingToolbar = ({ editorRef, isMobile, safeTop }) => {
    const [toolbarPosition, setToolbarPosition] = useState(null);

    useEffect(() => {
        const handleSelection = () => {
            if (typeof window === 'undefined') return;
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount || selection.isCollapsed) {
                setToolbarPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if (!editorRef.current || !editorRef.current.contains(selection.anchorNode)) {
                setToolbarPosition(null);
                return;
            }

            const offset = isMobile ? 80 : 60;
            const toolbarWidth = isMobile ? 220 : 170;
            const toolbarHeight = isMobile ? 56 : 46;
            const padding = 12;

            const maxLeft = window.innerWidth - toolbarWidth / 2 - padding;
            const minLeft = toolbarWidth / 2 + padding;
            const clampedLeft = Math.min(maxLeft, Math.max(minLeft, rect.left + rect.width / 2));

            const minTop = padding + safeTop;
            const maxTop = window.innerHeight - toolbarHeight - padding;
            const clampedTop = Math.min(maxTop, Math.max(minTop, rect.top - offset));

            setToolbarPosition({ top: clampedTop, left: clampedLeft });
        };

        document.addEventListener('selectionchange', handleSelection);
        return () => document.removeEventListener('selectionchange', handleSelection);
    }, [editorRef, isMobile, safeTop]);

    return {
        toolbarPosition,
        setToolbarPosition,
    };
};
