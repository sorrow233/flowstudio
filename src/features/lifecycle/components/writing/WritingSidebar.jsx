import React, { useMemo, useState } from 'react';
import { Search, Plus, Trash2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const WritingSidebar = ({ documents = [], activeDocId, onSelectDoc, onCreate, onDelete }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredDocId, setHoveredDocId] = useState(null);

    // Filter documents based on search
    const filteredDocs = useMemo(() => {
        if (!searchQuery) return documents;
        const lowerQ = searchQuery.toLowerCase();
        return documents.filter(doc =>
            (doc.title || '').toLowerCase().includes(lowerQ) ||
            (doc.content || '').toLowerCase().includes(lowerQ)
        );
    }, [documents, searchQuery]);

    // Group documents by date
    const groupedDocs = useMemo(() => {
        const groups = {
            today: [],
            yesterday: [],
            week: [],
            older: []
        };

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterdayStart = todayStart - 86400000;
        const weekStart = todayStart - 86400000 * 6;

        filteredDocs.forEach(doc => {
            const ts = doc.timestamp || Date.now();
            if (ts >= todayStart) {
                groups.today.push(doc);
            } else if (ts >= yesterdayStart) {
                groups.yesterday.push(doc);
            } else if (ts >= weekStart) {
                groups.week.push(doc);
            } else {
                groups.older.push(doc);
            }
        });

        return groups;
    }, [filteredDocs]);

    const renderDocItem = (doc) => (
        <motion.div
            key={doc.id}
            onClick={() => onSelectDoc && onSelectDoc(doc.id)}
            onMouseEnter={() => setHoveredDocId(doc.id)}
            onMouseLeave={() => setHoveredDocId(null)}
            whileHover={{ scale: 1.02, x: 2 }}
            className={`
                relative p-3 rounded-xl cursor-pointer transition-all duration-200 group
                ${activeDocId === doc.id
                    ? 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'}
            `}
        >
            <h4 className={`text-sm font-medium mb-1 truncate pr-6 ${activeDocId === doc.id ? 'text-pink-600 dark:text-pink-300' : 'text-gray-700 dark:text-gray-200'}`}>
                {doc.title || '无标题'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-light h-4">
                {doc.content?.replace(/<[^>]*>?/gm, '') || '无内容...'}
            </p>
            <div className="flex items-center justify-between mt-2 opacity-60">
                <span className="text-[10px] text-gray-400">
                    {new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {/* Delete Button - Only visible on hover or active */}
            {(hoveredDocId === doc.id || activeDocId === doc.id) && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('确定要删除吗？')) {
                            onDelete && onDelete(doc.id);
                        }
                    }}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title="删除"
                >
                    <Trash2 size={12} />
                </button>
            )}
        </motion.div>
    );

    const renderGroup = (title, docs) => {
        if (docs.length === 0) return null;
        return (
            <div className="mb-4">
                <h5 className="px-3 mb-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider opacity-70">{title}</h5>
                <div className="space-y-1">
                    {docs.map(renderDocItem)}
                </div>
            </div>
        );
    };

    return (
        <div className="w-80 h-full flex flex-col border-r border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
            {/* Header / Search */}
            <div className="p-4 pt-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors w-4 h-4" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索..."
                        className="w-full bg-gray-100/50 dark:bg-gray-800/50 border border-transparent focus:border-pink-200 dark:focus:border-pink-800 focus:bg-white dark:focus:bg-gray-900 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none transition-all duration-300"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 custom-scrollbar pb-4">
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                        <FileText size={32} strokeWidth={1} className="mb-2" />
                        <span className="text-xs">暂无文档</span>
                    </div>
                ) : (
                    <>
                        {renderGroup('今天', groupedDocs.today)}
                        {renderGroup('昨天', groupedDocs.yesterday)}
                        {renderGroup('最近 7 天', groupedDocs.week)}
                        {renderGroup('更早', groupedDocs.older)}
                    </>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200/30 dark:border-gray-800/30 flex items-center justify-end">
                <motion.button
                    onClick={onCreate}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-all flex items-center gap-2 px-4"
                >
                    <Plus size={20} />
                    <span className="text-sm font-medium">新建写作</span>
                </motion.button>
            </div>
        </div>
    );
};

export default WritingSidebar;
