import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Library, Globe2, Pencil, Trash2, X, Check } from 'lucide-react';
import { STORAGE_KEYS, DEV_STAGES, COMMAND_CATEGORIES } from '../../utils/constants';
import { v4 as uuidv4 } from 'uuid';

import StageSelector from './components/StageSelector';
import CommandList from './components/CommandList';
import CommandForm from './components/CommandForm';
import CategoryRenameModal from './components/CategoryRenameModal';
import { SharePublishModal, ShareBrowserModal } from '../share';
import LibraryImportModal from './components/LibraryImportModal';

import { useSync } from '../sync/SyncContext';
import { useSyncedProjects } from '../sync/useSyncStore';
import { useTranslation } from '../i18n';



const CommandCenterModule = () => {
    // --- Sync Integration ---
    const { doc } = useSync();
    const { t } = useTranslation();

    // Sync: Commands
    const {
        projects: commands,
        addProject: addCommand,
        updateProject: updateCommand,
        removeProject: deleteCommand
    } = useSyncedProjects(doc, 'all_commands');

    // Sync: Categories
    const {
        projects: syncedCategories,
        addProject: addCategory,
        updateProject: updateCat,
        removeProject: removeCat
    } = useSyncedProjects(doc, 'command_categories');

    // Merge default categories with synced custom labels
    const categories = useMemo(() => {
        if (syncedCategories && syncedCategories.length > 0) {
            return COMMAND_CATEGORIES.map(defaultCat => {
                const userCat = syncedCategories.find(c => c.id === defaultCat.id);
                return userCat ? { ...defaultCat, label: userCat.label } : defaultCat;
            });
        }
        return COMMAND_CATEGORIES;
    }, [syncedCategories]);

    // --- UI State ---
    const [activeStage, setActiveStage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    // --- Form State ---
    const [isAdding, setIsAdding] = useState(false);
    const [newCmd, setNewCmd] = useState({ title: '', content: '', type: 'utility', url: '', tags: [], category: 'general' });
    const [newTag, setNewTag] = useState({ label: '', value: '' });
    const [editingTagId, setEditingTagId] = useState(null);

    // --- Modal State ---
    const [isImporting, setIsImporting] = useState(false);
    const [isCommunityBrowsing, setIsCommunityBrowsing] = useState(false);
    const [sharingCommand, setSharingCommand] = useState(null);
    const [renamingCategory, setRenamingCategory] = useState(null);
    const [renameValue, setRenameValue] = useState('');


    // Category rename handler
    const updateCategoryName = (id, newName) => {
        const existingCat = syncedCategories.find(c => c.id === id);
        if (existingCat) {
            updateCat(id, { label: newName });
        } else {
            // First rename: add to synced categories
            addCategory({ id, label: newName });
        }
    };

    const handleAdd = () => {
        if (!newCmd.title.trim()) return;

        // Validation based on type
        if (newCmd.type === 'link' && !newCmd.url.trim()) return;
        if (newCmd.type !== 'link' && !newCmd.content.trim()) return;

        if (newCmd.id) {
            // Update existing
            updateCommand(newCmd.id, {
                title: newCmd.title.trim(),
                content: newCmd.content.trim(),
                url: newCmd.url.trim(),
                type: newCmd.type,
                tags: newCmd.tags || [],
                category: newCmd.category || 'general'
            });
        } else {
            // Create New
            addCommand({
                title: newCmd.title.trim(),
                content: newCmd.content.trim(),
                url: newCmd.url.trim(),
                type: newCmd.type,
                tags: newCmd.tags || [],
                category: newCmd.category || 'general',
                stageIds: [activeStage],
                createdAt: Date.now()
            });
        }

        setNewCmd({ title: '', content: '', type: 'utility', url: '', tags: [], category: 'general' });
        setIsAdding(false);
    };

    const handleAddTag = () => {
        if (!newTag.label.trim()) return;
        const tagValue = newTag.value.trim() || newCmd.content;

        if (editingTagId) {
            // Update existing tag
            const updatedTags = newCmd.tags.map(t =>
                t.id === editingTagId
                    ? { ...t, label: newTag.label.trim(), value: tagValue }
                    : t
            );
            setNewCmd({ ...newCmd, tags: updatedTags });
            setEditingTagId(null);
        } else {
            // Add new tag
            // Prevent duplicates based on label (optional, but good for sanity)
            if (newCmd.tags.some(t => t.label.toLowerCase() === newTag.label.trim().toLowerCase())) {
                alert(t('commands.tagExists'));
                return;
            }

            const tag = {
                id: uuidv4(),
                label: newTag.label.trim(),
                value: tagValue
            };
            setNewCmd({ ...newCmd, tags: [...(newCmd.tags || []), tag] });
        }
        setNewTag({ label: '', value: '' });
    };

    const handleImport = (cmd) => {
        const isInStage = cmd.stageIds?.includes(activeStage);
        if (!isInStage) {
            updateCommand(cmd.id, { stageIds: [...(cmd.stageIds || []), activeStage] });
        }
        setIsImporting(false);
    };

    const handleCommunityImport = (cmd) => {
        addCommand({
            ...cmd,
            stageIds: [activeStage],
            createdAt: Date.now()
        });
        setIsCommunityBrowsing(false);
    };

    const handleShare = (cmd) => {
        setSharingCommand(cmd);
    };

    const handleEdit = (cmd) => {
        setNewCmd({
            id: cmd.id,
            title: cmd.title,
            content: cmd.content || '',
            url: cmd.url || '',
            type: cmd.type,
            tags: cmd.tags || [],
            category: cmd.category || 'general'
        });
        setNewTag({ label: '', value: '' }); // Clear tag form when editing command
        setEditingTagId(null); // Clear editing tag state
        setIsAdding(true);
    };

    const handleRemove = (id) => {
        // Simple delete - just remove the command
        deleteCommand(id);
    };

    const handleCopy = (id, content) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleReorder = (reorderedStageCommands) => {
        reorderedStageCommands.forEach((cmd, index) => {
            updateCommand(cmd.id, { order: index });
        });
    };

    // Filter commands for current stage
    const stageCommands = commands.filter(c =>
        c.stageIds?.includes(activeStage)
    );

    // For Import Modal: Commands from ANY stage but current
    const importableCommands = commands.filter(c =>
        // Exclude commands already in this stage
        !(c.stageIds?.includes(activeStage)) &&
        (c.type === 'link' || c.type === 'utility')
    );

    // Search filtering
    const isSearching = search.trim().length > 0;
    const visibleCommands = stageCommands.filter(c => {
        const matchesSearch = !isSearching ||
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.content.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = (c.category || 'general') === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleSaveRename = () => {
        if (renamingCategory && renameValue.trim()) {
            updateCategoryName(renamingCategory.id, renameValue.trim());
            setRenamingCategory(null);
            setRenameValue('');
        }
    };

    return (
        <div className="max-w-7xl mx-auto pt-8 px-4 md:px-6 min-h-[100dvh] pb-safe md:h-[calc(100vh-4rem)] md:min-h-0 flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Ambient Background */}
            <div className="fixed inset-0 -z-10 bg-gray-50/50 pointer-events-none" />
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-gray-100 to-transparent -z-10 opacity-50" />

            {/* Sidebar / Stage Select */}
            <StageSelector
                activeStage={activeStage}
                setActiveStage={setActiveStage}
                commands={commands}
                selectedCategory={selectedCategory}
            />

            {/* Main Content */}
            <div className="flex-1 bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-4 md:p-10 shadow-2xl shadow-gray-200/50 flex flex-col relative overflow-hidden ring-1 ring-gray-100/50">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-50/50 to-transparent blur-3xl -z-10 pointer-events-none" />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 gap-6 md:gap-0">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-md bg-sky-50 text-[10px] font-bold tracking-widest uppercase text-sky-600">
                                {t('commands.stage')} 0{activeStage}
                            </span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-thin text-sky-600 dark:text-sky-400 mb-2">{t(`devStages.${activeStage}.title`, DEV_STAGES[activeStage - 1].title)}</h3>
                        <p className="text-gray-400 font-light max-w-lg leading-relaxed text-sm md:text-base">
                            {t(`devStages.${activeStage}.desc`, DEV_STAGES[activeStage - 1].desc)}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-4 w-full md:w-auto mt-4 md:mt-0">
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            {/* Community Button */}
                            <button
                                onClick={() => setIsCommunityBrowsing(true)}
                                className="flex-1 md:flex-initial group flex items-center justify-center gap-2 p-3 md:px-5 md:py-3 bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                                title={t('commands.browseCommunity')}
                            >
                                <Globe2 size={18} />
                                <span className="hidden md:inline font-medium text-sm">{t('commands.community')}</span>
                            </button>

                            {/* Import Button */}
                            <button
                                onClick={() => setIsImporting(true)}
                                className="flex-1 md:flex-initial group flex items-center justify-center gap-2 p-3 md:px-5 md:py-3 bg-white text-gray-600 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                                title={t('commands.importFromLibrary')}
                            >
                                <Library size={18} />
                                <span className="hidden md:inline font-medium text-sm">{t('commands.library')}</span>
                            </button>

                            {/* New Command Button */}
                            <button
                                onClick={() => {
                                    setNewCmd({ title: '', content: '', type: 'utility', url: '', tags: [], category: 'general' }); // Clear for new
                                    setNewTag({ label: '', value: '' });
                                    setEditingTagId(null);
                                    setIsAdding(true);
                                }}
                                className="flex-1 md:flex-initial group flex items-center justify-center gap-2 md:gap-3 p-3 md:px-6 md:py-3 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap min-w-[3.5rem]"
                            >
                                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span className="font-medium tracking-wide">{t('commands.newCommand')}</span>
                            </button>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end">
                            <div className="flex gap-2 w-full md:w-auto">

                                {/* Category Filter Pills - Dot Ribbon */}

                                <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-full overflow-x-auto no-scrollbar scrollbar-hide flex-1 md:flex-none md:max-w-[300px] xl:max-w-none shadow-inner border border-gray-200/50">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="relative group/cat">
                                            <button
                                                onClick={() => setSelectedCategory(cat.id)}
                                                onContextMenu={(e) => {
                                                    e.preventDefault();
                                                    setRenamingCategory({ id: cat.id, currentName: cat.label, color: cat.color });
                                                    setRenameValue(cat.label);
                                                }}
                                                className={`
                                                w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0 relative
                                                ${selectedCategory === cat.id
                                                        ? 'bg-white shadow-md scale-110 z-10 ring-2 ring-gray-100'
                                                        : 'hover:bg-white/50 hover:scale-105'}
                                            `}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${cat.color.split(' ')[0].replace('bg-', 'bg-')} ${selectedCategory === cat.id ? 'ring-2 ring-offset-2 ring-transparent' : ''}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="relative group shrink-0">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={t('common.search')}
                                        className="pl-9 pr-4 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white rounded-full text-sm border border-transparent hover:border-gray-200 focus:border-emerald-200 outline-none w-10 focus:w-40 md:focus:w-60 transition-all shadow-inner placeholder:text-transparent focus:placeholder:text-gray-300 cursor-pointer focus:cursor-text"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="popLayout">
                    <CommandForm
                        isAdding={isAdding}
                        newCmd={newCmd}
                        setNewCmd={setNewCmd}
                        newTag={newTag}
                        setNewTag={setNewTag}
                        editingTagId={editingTagId}
                        setEditingTagId={setEditingTagId}
                        categories={categories}
                        handleAdd={handleAdd}
                        handleAddTag={handleAddTag}
                        setIsAdding={setIsAdding}
                    />
                </AnimatePresence>

                <CommandList
                    visibleCommands={visibleCommands}
                    stageCommands={stageCommands}
                    handleReorder={handleReorder}
                    isSearching={isSearching}
                    isAdding={isAdding}
                    isImporting={isImporting}
                    activeStage={activeStage}
                    categories={categories}
                    handleEdit={handleEdit}
                    handleCopy={handleCopy}
                    handleRemove={handleRemove}
                    handleShare={handleShare}
                    setNewCmd={setNewCmd}
                    setIsAdding={setIsAdding}
                    setIsImporting={setIsImporting}
                    copiedId={copiedId}
                    commands={commands}
                    updateCommand={updateCommand}
                />
            </div>



            {/* Modals */}
            <CategoryRenameModal
                renamingCategory={renamingCategory}
                setRenamingCategory={setRenamingCategory}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                handleSaveRename={handleSaveRename}
            />

            <LibraryImportModal
                isImporting={isImporting}
                setIsImporting={setIsImporting}
                importableCommands={importableCommands}
                handleImport={handleImport}
            />

            <ShareBrowserModal
                isOpen={isCommunityBrowsing}
                onClose={() => setIsCommunityBrowsing(false)}
                onImport={handleCommunityImport}
            />

            <SharePublishModal
                isOpen={!!sharingCommand}
                onClose={() => setSharingCommand(null)}
                command={sharingCommand}
            />
        </div >
    );
};

export default CommandCenterModule;
