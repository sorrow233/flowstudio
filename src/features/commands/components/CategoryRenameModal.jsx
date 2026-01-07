import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryRenameModal = ({ renamingCategory, setRenamingCategory, renameValue, setRenameValue, handleSaveRename }) => {
    return (
        <AnimatePresence>
            {renamingCategory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setRenamingCategory(null)}
                        className="absolute inset-0 bg-white/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm ring-1 ring-gray-100"
                    >
                        <h3 className="text-lg font-light text-gray-900 mb-4">Rename Category</h3>

                        <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 ${renamingCategory.color.split(' ')[0].replace('bg-', 'bg-')}`} />
                            <input
                                autoFocus
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                                className="bg-transparent text-lg font-medium text-gray-900 outline-none w-full placeholder:text-gray-300"
                                placeholder="Category Name"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setRenamingCategory(null)}
                                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRename}
                                className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200"
                            >
                                Save
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CategoryRenameModal;
