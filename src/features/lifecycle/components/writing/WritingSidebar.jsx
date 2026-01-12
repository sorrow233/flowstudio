import React from 'react';
import { Search, Plus, FileText, Clock, Trash2, Folder } from 'lucide-react';
import { motion } from 'framer-motion';

const WritingSidebar = ({ activeDocId, onSelectDoc }) => {
    // Mock data for now
    const documents = [
        { id: '1', title: '一直坚强着，让自己奋斗起来', preview: '涌动的人潮中，遥远的天空...', date: 'Today' },
        { id: '2', title: '设计灵感记录', preview: '关于新界面的交互想法...', date: 'Yesterday' },
        { id: '3', title: '未命名文档', preview: '开始写作...', date: 'Jan 10' },
    ];

    return (
        <div className="w-80 h-full flex flex-col border-r border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
            {/* Header / Search */}
            <div className="p-4 pt-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-gray-100/50 dark:bg-gray-800/50 border border-transparent focus:border-pink-200 dark:focus:border-pink-800 focus:bg-white dark:focus:bg-gray-900 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none transition-all duration-300"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                {documents.map((doc) => (
                    <motion.div
                        key={doc.id}
                        onClick={() => onSelectDoc && onSelectDoc(doc.id)}
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                            p-3 rounded-xl cursor-pointer transition-all duration-200 group
                            ${activeDocId === doc.id
                                ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'}
                        `}
                    >
                        <h4 className={`text-sm font-medium mb-1 truncate ${activeDocId === doc.id ? 'text-pink-600 dark:text-pink-300' : 'text-gray-700 dark:text-gray-200'}`}>
                            {doc.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-light">
                            {doc.preview}
                        </p>
                        <div className="flex items-center justify-between mt-2 opacity-60">
                            <span className="text-[10px] text-gray-400">{doc.date}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200/30 dark:border-gray-800/30 flex items-center justify-between">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Trash2 size={16} />
                </button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-pink-500 text-white rounded-full shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-all"
                >
                    <Plus size={20} />
                </motion.button>
            </div>
        </div>
    );
};

export default WritingSidebar;
