import React from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';

const UndoRedoButtons = ({ onUndo, onRedo, canUndo, canRedo, className = '' }) => {
    return (
        <div className={`flex items-center gap-1 bg-white/50 backdrop-blur-sm border border-gray-100 p-1 rounded-lg shadow-sm ${className}`}>
            <ActionButton
                onClick={onUndo}
                disabled={!canUndo}
                icon={RotateCcw}
                label="Undo"
                shortcut="⌘Z"
            />
            <div className="w-px h-4 bg-gray-200 mx-0.5" />
            <ActionButton
                onClick={onRedo}
                disabled={!canRedo}
                icon={RotateCw}
                label="Redo"
                shortcut="⌘⇧Z"
            />
        </div>
    );
};

const ActionButton = ({ onClick, disabled, icon: Icon, label, shortcut }) => {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
            disabled={disabled}
            className={`
                group relative p-2 rounded-md transition-all duration-200 flex items-center justify-center
                ${disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm text-gray-700'
                }
            `}
            title={`${label} (${shortcut})`}
        >
            <Icon size={16} strokeWidth={2} />
        </motion.button>
    );
};

export default UndoRedoButtons;
