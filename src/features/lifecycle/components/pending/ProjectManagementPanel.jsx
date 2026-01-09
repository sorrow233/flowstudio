import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Settings2, Sprout, TreeDeciduous, TreePine, ChevronRight, Search, Filter, AlertTriangle } from 'lucide-react';

/**
 * ProjectManagementPanel - 项目管理面板
 * 显示和管理 primary 和 advanced 阶段的项目
 */
const ProjectManagementPanel = ({ isOpen, onClose, projects, onDeleteProject }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStage, setSelectedStage] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // 过滤 primary 和 advanced 项目
    const managedProjects = useMemo(() => {
        return projects.filter(p => p.stage === 'primary' || p.stage === 'advanced');
    }, [projects]);

    // 根据搜索和阶段过滤
    const filteredProjects = useMemo(() => {
        return managedProjects.filter(p => {
            const matchesSearch = searchQuery === '' ||
                p.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStage = selectedStage === 'all' || p.stage === selectedStage;
            return matchesSearch && matchesStage;
        });
    }, [managedProjects, searchQuery, selectedStage]);

    // 按阶段分组
    const primaryProjects = filteredProjects.filter(p => p.stage === 'primary');
    const advancedProjects = filteredProjects.filter(p => p.stage === 'advanced');

    const handleDelete = (projectId) => {
        onDeleteProject(projectId);
        setDeleteConfirm(null);
    };

    const getStageIcon = (stage, subStage = 1) => {
        if (stage === 'advanced' || subStage >= 6) {
            return <TreePine size={16} className="text-amber-500" />;
        }
        if (subStage >= 3) {
            return <TreeDeciduous size={16} className="text-emerald-500" />;
        }
        return <Sprout size={16} className="text-emerald-400" />;
    };

    const getStageLabel = (stage) => {
        if (stage === 'advanced') return 'Advanced';
        return 'Primary';
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[101] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Settings2 size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">项目管理</h2>
                                    <p className="text-xs text-gray-500">管理 Primary 和 Advanced 项目</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="搜索项目..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                />
                            </div>
                            <div className="flex gap-2">
                                {['all', 'primary', 'advanced'].map(stage => (
                                    <button
                                        key={stage}
                                        onClick={() => setSelectedStage(stage)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedStage === stage
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {stage === 'all' ? '全部' : stage === 'primary' ? 'Primary' : 'Advanced'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {filteredProjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <Sprout size={48} className="mb-4 opacity-50" />
                                    <p>没有找到匹配的项目</p>
                                </div>
                            ) : (
                                <>
                                    {/* Primary Projects */}
                                    {primaryProjects.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <TreeDeciduous size={14} className="text-emerald-500" />
                                                Primary 项目
                                                <span className="text-gray-400">({primaryProjects.length})</span>
                                            </h3>
                                            <div className="space-y-2">
                                                {primaryProjects.map(project => (
                                                    <ProjectItem
                                                        key={project.id}
                                                        project={project}
                                                        getStageIcon={getStageIcon}
                                                        deleteConfirm={deleteConfirm}
                                                        setDeleteConfirm={setDeleteConfirm}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Advanced Projects */}
                                    {advancedProjects.length > 0 && (
                                        <div>
                                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <TreePine size={14} className="text-amber-500" />
                                                Advanced 项目
                                                <span className="text-gray-400">({advancedProjects.length})</span>
                                            </h3>
                                            <div className="space-y-2">
                                                {advancedProjects.map(project => (
                                                    <ProjectItem
                                                        key={project.id}
                                                        project={project}
                                                        getStageIcon={getStageIcon}
                                                        deleteConfirm={deleteConfirm}
                                                        setDeleteConfirm={setDeleteConfirm}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <p className="text-xs text-gray-500 text-center">
                                共 {managedProjects.length} 个项目 · 删除操作不可撤销
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// 项目列表项组件
const ProjectItem = ({ project, getStageIcon, deleteConfirm, setDeleteConfirm, onDelete }) => {
    const isConfirming = deleteConfirm === project.id;

    return (
        <motion.div
            layout
            className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition-all"
        >
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                {getStageIcon(project.stage, project.subStage)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                    {project.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-1">
                    {project.desc || '无描述'}
                </p>
            </div>

            {/* Stage Badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${project.stage === 'advanced'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                }`}>
                {project.stage === 'advanced' ? 'ADV' : 'PRI'}
            </div>

            {/* Delete Button */}
            <AnimatePresence mode="wait">
                {isConfirming ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-2"
                    >
                        <button
                            onClick={() => onDelete(project.id)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                        >
                            <Trash2 size={12} />
                            确认删除
                        </button>
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors"
                        >
                            取消
                        </button>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDeleteConfirm(project.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 rounded-lg transition-all"
                    >
                        <Trash2 size={16} className="text-gray-400 group-hover:text-red-500" />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProjectManagementPanel;
