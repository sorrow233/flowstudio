import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const WritingDashboard = ({ onCreate, documents, t }) => {
    const recentDocs = useMemo(() => documents.slice(0, 4), [documents]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar relative z-10 p-8 lg:p-12 flex flex-col items-center justify-center">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-3xl animate-blob mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute top-[20%] right-[20%] w-96 h-96 bg-rose-200/20 dark:bg-rose-900/10 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />
                <div className="absolute bottom-[20%] left-[50%] w-96 h-96 bg-pink-200/20 dark:bg-pink-900/10 rounded-full blur-3xl animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" />
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="max-w-4xl w-full flex flex-col gap-10 relative z-10"
            >
                {/* Hero Section */}
                <motion.div variants={item} className="text-center space-y-4 mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-rose-500 to-purple-600 dark:from-white dark:via-rose-400 dark:to-purple-400 tracking-tight">
                        {t('inspiration.writing') || "Creative Space"}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t('inspiration.writingSubtitle') || "Capture your thoughts, shape your stories, and let your creativity flow."}
                    </p>
                </motion.div>

                {/* Main Action - Create */}
                <motion.div variants={item} className="flex justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -15px rgba(244, 63, 94, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCreate()}
                        className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full text-white font-semibold text-lg shadow-[0_10px_30px_-10px_rgba(244,63,94,0.5)] overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        <span className="relative flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {t('inspiration.newDoc')}
                        </span>
                    </motion.button>
                </motion.div>

                {/* Recent Documents Grid */}
                {recentDocs.length > 0 && (
                    <motion.div variants={item} className="space-y-6 mt-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                {t('inspiration.timeGroup.today') || "Jump Back In"}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentDocs.map((doc, idx) => (
                                <motion.div
                                    key={doc.id}
                                    variants={item}
                                    whileHover={{ y: -5 }}
                                    onClick={() => onCreate(doc)}
                                    className="group relative p-6 bg-white/60 dark:bg-gray-800/40 backdrop-blur-md rounded-3xl border border-white/60 dark:border-gray-700/50 hover:border-rose-400/50 dark:hover:border-rose-500/50 transition-all cursor-pointer shadow-sm hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative z-10 flex flex-col gap-3">
                                        <div className="flex items-start justify-between">
                                            <div className="p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-[11px] font-medium text-gray-400 bg-gray-100/50 dark:bg-gray-700/30 px-2 py-1 rounded-full">
                                                {new Date(doc.lastModified || doc.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                                                {doc.title || t('inspiration.untitled')}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                                {(doc.content || '').replace(/<[^>]*>?/gm, '') || t('inspiration.placeholder')}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default WritingDashboard;
