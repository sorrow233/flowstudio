import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Copy, Check, Box, Shield, CreditCard, Globe, Server, Database, Layout, Mail, Bell } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PRESET_MODULES = [
    {
        id: 'auth-core',
        name: 'Authentication Core',
        description: 'User registration, login, JWT handling, and session management.',
        category: 'backend',
        icon: Shield,
        stage: 4,
        progress: 100
    },
    {
        id: 'payment-stripe',
        name: 'Stripe Payments',
        description: 'Subscription handling, checkout flow, and webhook processing.',
        category: 'feature',
        icon: CreditCard,
        stage: 4,
        progress: 80
    },
    {
        id: 'seo-bundle',
        name: 'SEO Bundle',
        description: 'Sitemap generation, meta tags, OpenGraph, and structured data.',
        category: 'frontend',
        icon: Globe,
        stage: 5,
        progress: 100
    },
    {
        id: 'api-gateway',
        name: 'API Gateway',
        description: 'Centralized request routing, rate limiting, and logging.',
        category: 'backend',
        icon: Server,
        stage: 3,
        progress: 60
    },
    {
        id: 'db-postgres',
        name: 'PostgreSQL Schema',
        description: 'Core database migrations, ORM setup, and initial indexing.',
        category: 'database',
        icon: Database,
        stage: 4,
        progress: 90
    },
    {
        id: 'ui-kit',
        name: 'UI Design System',
        description: 'Tailwind config, reusable atomic components, and theme provider.',
        category: 'frontend',
        icon: Layout,
        stage: 4,
        progress: 100
    },
    {
        id: 'email-service',
        name: 'Transactional Emails',
        description: 'SendGrid/Resend integration for welcome, password reset emails.',
        category: 'feature',
        icon: Mail,
        stage: 3,
        progress: 50
    },
    {
        id: 'notification-center',
        name: 'Notification System',
        description: 'In-app real-time notifications and push alert preferences.',
        category: 'feature',
        icon: Bell,
        stage: 2,
        progress: 30
    }
];

const ModuleLibraryModal = ({ isOpen, onClose, onAddModule }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [addedIds, setAddedIds] = useState(new Set());

    const filteredModules = PRESET_MODULES.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = (preset) => {
        // Create a deep copy with new UUID
        const newModule = {
            ...preset,
            id: uuidv4(),
            // Remove the preset ID from the actual object derived
            // Keep other props like stage/progress as "starter" values
        };
        // Remove preset.id from properties we rely on uuid for checking 'added' locally only

        onAddModule([newModule]);

        // Show visual feedback
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
                className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden ring-1 ring-gray-100 flex flex-col h-[80vh]"
            >
                {/* Header */}
                <div className="p-8 pb-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <Box size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest">Module Library</span>
                        </div>
                        <h2 className="text-2xl font-light text-gray-900">Accelerate Development</h2>
                        <p className="text-gray-400 text-sm mt-1 font-light">
                            Select pre-built modules to instantly populate your project roadmap.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for Auth, Payment, Database..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 transition-all font-light"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredModules.map(module => {
                            const isAdded = addedIds.has(module.id);
                            const Icon = module.icon;

                            return (
                                <div key={module.id} className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-blue-100 transition-all flex flex-col justify-between h-[180px]">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2.5 bg-gray-50 text-gray-500 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <Icon size={20} />
                                            </div>
                                            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-400 rounded-md">
                                                {module.category}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">{module.name}</h3>
                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{module.description}</p>
                                    </div>

                                    <button
                                        onClick={() => handleAdd(module)}
                                        disabled={isAdded}
                                        className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all
                                            ${isAdded
                                                ? 'bg-emerald-50 text-emerald-600 cursor-default'
                                                : 'bg-gray-900 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                                            }
                                        `}
                                    >
                                        {isAdded ? (
                                            <>
                                                <Check size={14} strokeWidth={3} />
                                                <span>Added</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                <span>Add Module</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default ModuleLibraryModal;
