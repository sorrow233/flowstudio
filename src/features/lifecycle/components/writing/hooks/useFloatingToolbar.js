import { useEffect, useState } from 'react';

export const useFloatingToolbar = ({ editorRef, isMobile, safeTop }) => {
    const [toolbarPosition, setToolbarPosition] = useState(null);

    useEffect(() => {
        const isNodeInsideEditor = (node) => {
            if (!node || !editorRef.current) return false;
            if (editorRef.current === node) return true;
            return editorRef.current.contains(node);
        };

        const handleSelection = () => {
            if (typeof window === 'undefined') return;
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount || selection.isCollapsed) {
                setToolbarPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const selectionText = selection.toString();
            if (!selectionText.trim()) {
                setToolbarPosition(null);
                return;
            }

            const rect = range.getBoundingClientRect();
            const insideEditor = isNodeInsideEditor(range.commonAncestorContainer)
                || isNodeInsideEditor(selection.anchorNode)
                || isNodeInsideEditor(selection.focusNode);

            if (!editorRef.current || !insideEditor || !rect) {
                setToolbarPosition(null);
                return;
            }

            const offset = isMobile ? 86 : 64;
            const toolbarWidth = isMobile
                ? Math.min(window.innerWidth - 16, 350)
                : 420;
            const toolbarHeight = isMobile ? 62 : 48;
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
