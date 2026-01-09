import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Save, Image as ImageIcon } from 'lucide-react';

const ProjectSettingsModal = ({ isOpen, onClose, project, onUpdate, onDelete }) => {
    const [localProject, setLocalProject] = useState(project);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalProject(project);
        setHasChanges(false);
    }, [project, isOpen]);

    const handleChange = (field, value) => {
        setLocalProject(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = () => {
        onUpdate(project.id, localProject);
        setHasChanges(false);
        onClose();
    };

    if (!isOpen || !localProject) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/60 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-gray-100 dark:ring-gray-800 flex flex-col"
            >
                {/* Header */}
                <div className="p-8 pb-6 flex justify-between items-start border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-1">Project Settings</h2>
                        <p className="text-sm text-gray-400">Manage project details and configuration</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                    {/* General Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Project Name</label>
                            <input
                                value={localProject.title || ''}
                                onChange={(e) => handleChange('title', e.target.value)}
                                className="w-full text-lg text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-red-100"
                                placeholder="Project Title"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Description</label>
                            <textarea
                                value={localProject.desc || ''}
                                onChange={(e) => handleChange('desc', e.target.value)}
                                className="w-full text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-none focus:ring-2 focus:ring-red-100 resize-none h-24"
                                placeholder="Describe the project..."
                            />
                        </div>
                    </div>

                    {/* Appearance */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Appearance</label>
                        <div className="space-y-3">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <ImageIcon size={16} className="text-gray-400" />
                                </div>
                                <input
                                    value={localProject.bgImage || ''}
                                    onChange={(e) => handleChange('bgImage', e.target.value)}
                                    className="w-full text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl pl-10 pr-4 py-3 border-none focus:ring-2 focus:ring-red-100 font-mono"
                                    placeholder="https://..."
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 pl-1">
                                Enter a valid image URL for the project background card.
                            </p>

                            {/* Preview */}
                            {localProject.bgImage && (
                                <div className="mt-4 h-32 w-full rounded-xl overflow-hidden relative border border-gray-100 dark:border-gray-800">
                                    <img
                                        src={localProject.bgImage}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                                        <span className="text-white text-xs font-medium">Background Preview</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
                                onDelete(project.id);
                            }
                        }}
                        className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={18} />
                        <span className="text-sm">Delete Project</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${hasChanges
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ProjectSettingsModal;
