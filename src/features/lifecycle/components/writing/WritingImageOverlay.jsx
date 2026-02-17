
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useTranslation } from '../../../i18n';

const WritingImageOverlay = ({ selectedImage, editorRef, onDelete }) => {
    const { t } = useTranslation();
    const [rect, setRect] = useState(null);

    // Update overlay position based on image
    useEffect(() => {
        if (!selectedImage || !editorRef.current) return;

        const updatePosition = () => {
            if (!editorRef.current?.contains(selectedImage)) return;

            const editorRect = editorRef.current.getBoundingClientRect();
            const imgRect = selectedImage.getBoundingClientRect();

            setRect({
                top: imgRect.top - editorRect.top,
                left: imgRect.left - editorRect.left,
                width: imgRect.width,
                height: imgRect.height,
            });
        };

        updatePosition();

        // Add listeners for resize/scroll if needed, typically editor re-renders handle simple cases,
        // but window resize is good to track.
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [selectedImage, editorRef]);

    if (!selectedImage || !rect) return null;

    return (
        <motion.div
            key="img-overlay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-10"
            style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            }}
        >
            {/* Active Outline */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-sky-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 bg-sky-500/10 transition-all duration-200" />

            {/* Controls */}
            <div className="absolute -top-3 -right-3 flex gap-2 pointer-events-auto">
                <button
                    onMouseDown={(e) => {
                        // Crucial: Prevent focus loss from editor
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-red-600 hover:scale-110 active:scale-95 transition-all duration-200 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-red-500 dark:hover:text-white"
                    title={t('common.delete', 'Delete')}
                >
                    <Trash2 size={15} strokeWidth={2.5} />
                </button>
            </div>
        </motion.div>
    );
};

export default WritingImageOverlay;
