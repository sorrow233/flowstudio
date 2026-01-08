import React, { useState } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UndoRedoButtons = ({ onUndo, onRedo, canUndo, canRedo, className = '' }) => {
    return (
        <div className={`flex items-center gap-0.5 bg-white/50 backdrop-blur-md border border-gray-100 p-1 rounded-xl shadow-sm ${className}`}>
            <ActionButton
                onClick={onUndo}
                disabled={!canUndo}
                icon={RotateCcw}
                label="Undo"
                shortcut="⌘Z"
            />
            <div className="w-px h-4 bg-gray-200/50 mx-0.5" />
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
    const [hovered, setHovered] = useState(false);

    return (
        <div className="relative flex flex-col items-center">
            <motion.button
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
                disabled={disabled}
                className={`
                    relative p-2 rounded-lg transition-all duration-200 flex items-center justify-center
                    ${disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md hover:shadow-gray-200/50'
                    }
                `}
            >
                <Icon size={18} strokeWidth={1.5} />
            </motion.button>

            <AnimatePresence>
                {hovered && !disabled && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none"
                    >
                        {label} <span className="opacity-50 ml-1 font-mono">{shortcut}</span>
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UndoRedoButtons;
