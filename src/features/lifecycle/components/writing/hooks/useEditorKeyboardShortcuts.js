import { useEffect } from 'react';

export const useEditorKeyboardShortcuts = ({
    editorRef,
    canUndo,
    canRedo,
    onSave,
    onUndo,
    onRedo,
    onMarkdownShortcut,
}) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            const editorElement = editorRef.current;
            if (!editorElement || document.activeElement !== editorElement) return;

            const isMod = event.metaKey || event.ctrlKey;
            if (!isMod) return;

            const key = event.key.toLowerCase();
            if (key === 's') {
                event.preventDefault();
                onSave?.();
                return;
            }

            if (key === 'z' && !event.shiftKey) {
                event.preventDefault();
                if (canUndo) onUndo?.();
                return;
            }

            if ((key === 'z' && event.shiftKey) || key === 'y') {
                event.preventDefault();
                if (canRedo) onRedo?.();
                return;
            }

            if (key === 'b') {
                event.preventDefault();
                onMarkdownShortcut?.('bold');
                return;
            }

            if (key === 'i') {
                event.preventDefault();
                onMarkdownShortcut?.('italic');
                return;
            }

            if (key === 'x' && event.shiftKey) {
                event.preventDefault();
                onMarkdownShortcut?.('strikethrough');
                return;
            }

            if (key === 'k') {
                event.preventDefault();
                onMarkdownShortcut?.('link');
                return;
            }

            if (key === 'e') {
                event.preventDefault();
                onMarkdownShortcut?.('inlineCode');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [canRedo, canUndo, editorRef, onMarkdownShortcut, onRedo, onSave, onUndo]);
};
