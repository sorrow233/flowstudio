import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, X, Link as LinkIcon, Command, Download, Layers } from 'lucide-react';
import { useTranslation } from '../../i18n';

const LibraryImportModal = ({
    isImporting,
    setIsImporting,
    importableCommands,
    handleImport,
}) => {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {isImporting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsImporting(false)}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] flex flex-col relative z-50"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-light text-gray-900 flex items-center gap-2">
                                    <Library size={20} /> {t('commands.globalLibrary')}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">{t('commands.importFromOther')}</p>
                            </div>
                            <button onClick={() => setIsImporting(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {importableCommands.length > 0 ? (
                                importableCommands.map(cmd => (
                                    <div key={cmd.id || Math.random()} className="flex justify-between items-center p-3 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-gray-100">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-medium text-gray-900 truncate">{cmd.title}</h4>
                                                {/* Stage badges */}
                                                <div className="flex gap-1">
                                                    {cmd.stageIds?.map(sid => (
                                                        <span key={sid} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded">
                                                            S{sid}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-400 font-mono line-clamp-1">{cmd.url || cmd.content}</p>
                                        </div>
                                        <button
                                            onClick={() => handleImport(cmd)}
                                            className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-2 shrink-0 ml-3"
                                        >
                                            <Download size={14} /> {t('common.add')}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Library size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>{t('commands.noImportable')}</p>
                                    <p className="text-xs mt-2">{t('commands.noImportableHint')}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LibraryImportModal;

