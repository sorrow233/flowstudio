import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Save, Activity, Check } from 'lucide-react';

const STAGE_LABELS = {
    1: 'Prototype',
    2: 'Alpha',
    3: 'Beta',
    4: 'Stable',
    5: 'Locked'
};

const ModuleDetailModal = ({ isOpen, onClose, module, onUpdate, onDelete }) => {
    const [localModule, setLocalModule] = useState(module);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalModule(module);
        setHasChanges(false);
    }, [module, isOpen]);

    const handleChange = (field, value) => {
        setLocalModule(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = () => {
        onUpdate(module.id, localModule);
        setHasChanges(false);
        onClose();
    };

    if (!isOpen || !localModule) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/60 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                layoutId={`module-${module.id}`} // visual continuity
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-gray-100 flex flex-col"
            >
                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 rounded-md bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {localModule.category}
                            </span>
                        </div>
                        <input
                            value={localModule.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="text-3xl font-light text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full"
                        />
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Description</label>
                        <textarea
                            value={localModule.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full text-sm text-gray-600 bg-gray-50 rounded-xl p-3 border-none focus:ring-1 focus:ring-emerald-200 resize-none h-24"
                        />
                    </div>

                    {/* Micro-Lifecycle Controls */}
                    <div className="space-y-6">
                        {/* Stage Slider */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Maturity Stage</label>
                                <span className={`text-sm font-medium ${localModule.stage === 4 ? 'text-emerald-600' : 'text-blue-500'
                                    }`}>
                                    {STAGE_LABELS[localModule.stage]}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1" max="5"
                                value={localModule.stage}
                                onChange={(e) => handleChange('stage', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gray-900"
                            />
                            <div className="flex justify-between mt-1 px-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <div key={s} className="w-px h-2 bg-gray-200" />
                                ))}
                            </div>
                        </div>

                        {/* Progress Slider */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completion</label>
                                <span className="text-sm font-mono text-gray-500">{localModule.progress}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={localModule.progress}
                                onChange={(e) => handleChange('progress', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <button
                        onClick={() => {
                            if (confirm("Confirm delete module?")) onDelete(module.id);
                        }}
                        className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={18} />
                        <span className="text-sm">Remove</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all ${hasChanges
                                ? 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl hover:-translate-y-1'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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

export default ModuleDetailModal;
