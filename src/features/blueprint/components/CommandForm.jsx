import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Link as LinkIcon, Globe, Terminal, Tag, X } from 'lucide-react';

const CommandForm = ({
    isAdding,
    newCmd,
    setNewCmd,
    newTag,
    setNewTag,
    editingTagId,
    setEditingTagId,
    categories,
    handleAdd,
    handleAddTag,
    setIsAdding
}) => {

    // Internal handlers to keep the form logic cleaner
    const handleEditTagClick = (tag) => {
        setNewTag({ label: tag.label, value: tag.value });
        setEditingTagId(tag.id);
    };

    const handleCancelTagEdit = () => {
        setNewTag({ label: '', value: '' });
        setEditingTagId(null);
    };

    const handleRemoveTag = (tagId) => {
        setNewCmd({ ...newCmd, tags: newCmd.tags.filter(t => t.id !== tagId) });
        if (editingTagId === tagId) {
            handleCancelTagEdit();
        }
    };

    return (
        <AnimatePresence mode="popLayout">
            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-8 mb-8 shadow-xl shadow-emerald-500/5 relative overflow-hidden max-h-[80vh] overflow-y-auto custom-scrollbar"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-10 opacity-50" />

                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-light text-gray-900 dark:text-white">{newCmd.id ? 'Edit Command' : 'Create New Command'}</h4>
                            {/* Type Selector */}
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                                {[
                                    { id: 'utility', label: 'Utility (Copy)', icon: Copy },
                                    { id: 'mandatory', label: 'Mandatory (Task)', icon: Check },
                                    { id: 'link', label: 'Link (URL)', icon: LinkIcon }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setNewCmd({ ...newCmd, type: type.id })}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all
                                            ${newCmd.type === type.id
                                                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}
                                        `}
                                    >
                                        <type.icon size={14} />
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Selector (Enhanced Dots) */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</span>
                                {newCmd.category && newCmd.category !== 'general' && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${categories.find(c => c.id === newCmd.category)?.color.replace('text-', 'bg-').replace('bg-', 'text-opacity-80 text-') || 'bg-gray-100 text-gray-500'}`}>
                                        {categories.find(c => c.id === newCmd.category)?.label}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                {categories.map(cat => {
                                    const isSelected = newCmd.category === cat.id;
                                    // Extract color name (e.g., 'blue', 'emerald') from 'bg-blue-400'
                                    const colorName = cat.color.split(' ')[0].split('-')[1];

                                    return (
                                        <div key={cat.id} className="relative group/formcat">
                                            <button
                                                onClick={() => setNewCmd({ ...newCmd, category: cat.id })}
                                                className={`
                                                    w-6 h-6 flex items-center justify-center rounded-full transition-all
                                                    ${isSelected
                                                        ? `scale-110 ring-2 ring-offset-2 ring-${colorName}-400`
                                                        : 'hover:scale-110 opacity-40 hover:opacity-100'}
                                                `}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${cat.color.split(' ')[0]}`} />
                                            </button>

                                            {/* Tooltip */}
                                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover/formcat:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-medium tracking-wide">
                                                {cat.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Title Input */}
                        <input
                            className="w-full bg-transparent text-2xl font-light outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 border-b border-transparent focus:border-gray-100 dark:focus:border-gray-700 text-gray-900 dark:text-white pb-2 transition-colors"
                            placeholder="Command Title..."
                            autoFocus={!newCmd.id}
                            value={newCmd.title}
                            onChange={e => setNewCmd({ ...newCmd, title: e.target.value })}
                        />

                        {/* Content Inputs based on Type */}
                        <div className="space-y-4">
                            {newCmd.type === 'link' && (
                                <div className="relative rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-gray-50/30 dark:bg-gray-800/30 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-2 focus-within:ring-emerald-100 dark:focus-within:ring-emerald-900/30 transition-all">
                                    <div className="absolute top-3 left-4 text-gray-300 dark:text-gray-600 pointer-events-none">
                                        <Globe size={16} />
                                    </div>
                                    <input
                                        className="w-full bg-transparent p-3 pl-12 text-sm font-mono text-emerald-600 dark:text-emerald-400 outline-none"
                                        placeholder="https://..."
                                        value={newCmd.url}
                                        onChange={e => setNewCmd({ ...newCmd, url: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="relative rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-gray-50/30 dark:bg-gray-800/30 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-2 focus-within:ring-emerald-100 dark:focus-within:ring-emerald-900/30 transition-all">
                                <div className="absolute top-3 left-4 text-gray-300 dark:text-gray-600 pointer-events-none">
                                    <Terminal size={16} />
                                </div>
                                <textarea
                                    className="w-full bg-transparent p-4 pl-12 text-sm font-mono text-gray-600 dark:text-gray-300 outline-none resize-y min-h-[120px]"
                                    placeholder={newCmd.type === 'link' ? "(Optional) Content to copy before opening URL..." : "Enter your system instruction or prompt here..."}
                                    value={newCmd.content}
                                    onChange={e => setNewCmd({ ...newCmd, content: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Tags Section (Only for Utility) */}
                        {newCmd.type === 'utility' && (
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Tag size={12} /> Tags & Variants
                                    </span>
                                    {editingTagId && (
                                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium animate-pulse">
                                            Editing Tag...
                                        </span>
                                    )}
                                </div>

                                <div className="flex gap-2 items-start">
                                    <div className="flex-1 space-y-1">
                                        <input
                                            className={`
                                                w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400
                                                ${editingTagId
                                                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30 text-amber-900 dark:text-amber-100'
                                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:border-emerald-200 dark:focus:border-emerald-800 focus:ring-2 focus:ring-emerald-50 dark:focus:ring-emerald-900/20 text-gray-900 dark:text-gray-100'}
                                            `}
                                            placeholder="Label (e.g. 'Prod')"
                                            value={newTag.label}
                                            onChange={e => setNewTag({ ...newTag, label: e.target.value })}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (newTag.label.trim()) handleAddTag();
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex-[2] space-y-1">
                                        <input
                                            className={`
                                                w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-all font-mono placeholder:text-gray-400
                                                ${editingTagId
                                                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-900/30 text-amber-900 dark:text-amber-100'
                                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-700 focus:border-emerald-200 dark:focus:border-emerald-800 focus:ring-2 focus:ring-emerald-50 dark:focus:ring-emerald-900/20 text-gray-600 dark:text-gray-300'}
                                            `}
                                            placeholder="Content Override (Optional)"
                                            value={newTag.value}
                                            onChange={e => setNewTag({ ...newTag, value: e.target.value })}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (newTag.label.trim()) handleAddTag();
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={handleAddTag}
                                            disabled={!newTag.label.trim()}
                                            className={`
                                                px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                                                ${editingTagId
                                                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200 dark:shadow-none'
                                                    : 'bg-gray-900 dark:bg-emerald-600 text-white hover:bg-black dark:hover:bg-emerald-500 shadow-lg shadow-gray-200 dark:shadow-none'}
                                                disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed
                                            `}
                                        >
                                            {editingTagId ? 'Update' : 'Add'}
                                        </button>
                                        {editingTagId && (
                                            <button
                                                onClick={handleCancelTagEdit}
                                                className="px-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                title="Cancel Edit"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Added Tags List */}
                                {(newCmd.tags && newCmd.tags.length > 0) && (
                                    <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100/50 dark:border-gray-700/50 min-h-[60px]">
                                        {newCmd.tags.map(tag => (
                                            <div
                                                key={tag.id}
                                                onClick={() => handleEditTagClick(tag)}
                                                className={`
                                                    group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all select-none
                                                    ${editingTagId === tag.id
                                                        ? 'bg-amber-100 text-amber-800 border-amber-300 ring-2 ring-amber-200 ring-offset-1'
                                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-sm'}
                                                `}
                                            >
                                                <Tag size={12} className={editingTagId === tag.id ? 'text-amber-600' : 'text-gray-400 group-hover:text-emerald-500'} />
                                                <span>{tag.label}</span>
                                                {tag.value && (
                                                    <>
                                                        <span className="text-gray-300">|</span>
                                                        <span className="font-mono opacity-60 max-w-[120px] truncate text-[10px]">{tag.value}</span>
                                                    </>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveTag(tag.id); }}
                                                    className="ml-1 p-0.5 hover:bg-red-50 hover:text-red-500 rounded-md text-gray-400 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {newCmd.tags.length === 0 && (
                                            <div className="text-gray-400 text-xs italic p-2 w-full text-center">No tags added yet.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-6 py-2.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={!newCmd.title.trim() || (newCmd.type === 'link' ? !newCmd.url.trim() : !newCmd.content.trim())}
                            className="px-8 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            {newCmd.id ? 'Save Changes' : 'Create Command'}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CommandForm;
