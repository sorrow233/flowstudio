import { toast } from 'sonner';
import { useAppShortcut } from '../features/shortcuts';

/**
 * Hook to handle global keyboard shortcuts for Undo/Redo.
 * 使用新的快捷键系统，获得 IME 防御和统一管理
 * 
 * @param {Function} undo - The undo function from useSyncedProjects
 * @param {Function} redo - The redo function from useSyncedProjects
 */
export const useUndoShortcuts = (undo, redo) => {
    // Undo: Cmd+Z / Ctrl+Z
    useAppShortcut('UNDO', () => {
        if (undo) {
            undo();
            toast.info('已撤销', { duration: 1000, position: 'bottom-center' });
        }
    });

    // Redo: Cmd+Shift+Z / Ctrl+Y
    useAppShortcut('REDO', () => {
        if (redo) {
            redo();
            toast.success('已重做', { duration: 1000, position: 'bottom-center' });
        }
    });
};

