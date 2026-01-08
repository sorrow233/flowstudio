import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook to handle global keyboard shortcuts for Undo/Redo.
 * @param {Function} undo - The undo function from useSyncedProjects
 * @param {Function} redo - The redo function from useSyncedProjects
 */
export const useUndoShortcuts = (undo, redo) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Avoid conflict with inputs unless it's a "global" intent (optional refinement)
            const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
            if (isInput) return;

            // CMD+Z or CTRL+Z
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                if (e.shiftKey) {
                    // Redo: CMD+SHIFT+Z
                    e.preventDefault();
                    if (redo) {
                        redo();
                        toast.success('Redid Change', { duration: 1000, position: 'bottom-center' });
                    }
                } else {
                    // Undo: CMD+Z
                    e.preventDefault();
                    if (undo) {
                        undo();
                        toast.info('Undid Change', { duration: 1000, position: 'bottom-center' });
                    }
                }
            }
            // Redo: CTRL+Y (Windows standard)
            if ((e.ctrlKey) && e.key === 'y') {
                e.preventDefault();
                if (redo) {
                    redo();
                    toast.success('Redid Change', { duration: 1000, position: 'bottom-center' });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);
};
