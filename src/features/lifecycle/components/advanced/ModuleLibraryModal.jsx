import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Copy, Check, Box, Shield, CreditCard, Globe, Server, Database, Layout, Mail, Bell, Activity } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = [
    { id: 'all', label: 'All Modules' },
    { id: 'frontend', label: 'Frontend' },
    { id: 'backend', label: 'Backend' },
    { id: 'database', label: 'Database' },
    { id: 'feature', label: 'Features' },
    { id: 'security', label: 'Security' },
];

const PRESET_MODULES = [
    {
        id: 'auth-core',
        name: 'Authentication Core',
        description: 'User registration, login, JWT handling, and session management.',
        category: 'backend',
        icon: Shield,
        stage: 4,
        progress: 100,
        priority: 'High'
    },
    {
        id: 'payment-stripe',
        name: 'Stripe Payments',
        description: 'Subscription handling, checkout flow, and webhook processing.',
        category: 'feature',
        icon: CreditCard,
        stage: 4,
        progress: 80,
        priority: 'High'
    },
    {
        id: 'seo-bundle',
        name: 'SEO Bundle',
        description: 'Sitemap generation, meta tags, OpenGraph, and structured data.',
        category: 'frontend',
        icon: Globe,
        stage: 5,
        progress: 100,
        priority: 'Medium'
    },
    {
        id: 'api-gateway',
        name: 'API Gateway',
        description: 'Centralized request routing, rate limiting, and logging.',
        category: 'backend',
        icon: Server,
        stage: 3,
        progress: 60,
        priority: 'High'
    },
    {
        id: 'db-postgres',
        name: 'PostgreSQL Schema',
        description: 'Core database migrations, ORM setup, and initial indexing.',
        category: 'database',
        icon: Database,
        stage: 4,
        progress: 90,
        priority: 'High'
    },
    {
        id: 'ui-kit',
        name: 'UI Design System',
        description: 'Tailwind config, reusable atomic components, and theme provider.',
        category: 'frontend',
        icon: Layout,
        stage: 4,
        progress: 100,
        priority: 'Medium'
    },
    {
        id: 'email-service',
        name: 'Transactional Emails',
        description: 'SendGrid/Resend integration for welcome, password reset emails.',
        category: 'feature',
        icon: Mail,
        stage: 3,
        progress: 50,
        priority: 'Low'
    },
    {
        id: 'notification-center',
        name: 'Notification System',
        description: 'In-app real-time notifications and push alert preferences.',
        category: 'feature',
        icon: Bell,
        stage: 2,
        progress: 30,
        priority: 'Medium'
    }
];

const ModuleLibraryModal = ({ isOpen, onClose, onAddModule }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [addedIds, setAddedIds] = useState(new Set());

    const filteredModules = PRESET_MODULES.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAdd = (preset) => {
        const newModule = {
            ...preset,
            id: uuidv4(),
        };
        onAddModule([newModule]);

        setAddedIds(prev => new Set(prev).add(preset.id));
        setTimeout(() => {
            setAddedIds(prev => {
                const next = new Set(prev);
                next.delete(preset.id);
                return next;
            });
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden ring-1 ring-gray-100 flex flex-col h-[85vh]"
            >
                {/* Header */}
                <div className="p-8 pb-6 border-b border-gray-100 flex justify-between items-start bg-gradient-to-b from-gray-50/50 to-white">
                    <div>
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <Box size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Module Library</span>
                        </div>
                        <h2 className="text-3xl font-light text-gray-900 tracking-tight">Accelerate Development</h2>
                        <p className="text-gray-400 text-sm mt-1 font-light">
                            Select pre-built modules to instantly populate your project roadmap.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Controls */}
                <div className="px-8 py-4 border-b border-gray-100 bg-white flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-10">
                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${activeCategory === cat.id
                                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-100'
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-gray-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredModules.map(module => {
                            const isAdded = addedIds.has(module.id);
                            const Icon = module.icon;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={module.id}
                                    className="group bg-white border border-gray-100 rounded-[1.5rem] p-6 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all flex flex-col h-[220px] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                                            {module.priority} Priority
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-500 flex items-center justify-center mb-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Icon size={24} strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{module.name}</h3>
                                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{module.description}</p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300">
                                            {module.category}
                                        </span>
                                        <button
                                            onClick={() => handleAdd(module)}
                                            disabled={isAdded}
                                            className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all
                                                ${isAdded
                                                    ? 'bg-emerald-50 text-emerald-600 cursor-default'
                                                    : 'bg-gray-900 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                                                }
                                            `}
                                        >
                                            {isAdded ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                                            {isAdded ? 'Added' : 'Add'}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    {filteredModules.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                            <Search size={48} className="mb-4 opacity-50" />
                            <p>No modules found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>

            </motion.div>
        </div>
    );
};

export default ModuleLibraryModal;
