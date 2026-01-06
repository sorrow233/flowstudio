import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Layers as IconLayers, Layout as IconLayout, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ModuleCard = ({ title, icon: Icon, description, to, color, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: index * 0.1
        }}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        className="h-full"
    >
        <Link to={to} className="card h-full flex flex-col relative overflow-hidden group">
            {/* Ambient Glow */}
            <div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-opacity duration-500 group-hover:opacity-40"
                style={{ backgroundColor: color }}
            />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 transition-transform duration-300 group-hover:rotate-6"
                        style={{ background: `linear-gradient(135deg, ${color}20, transparent)` }}
                    >
                        <Icon size={28} color={color} />
                    </div>
                    <div className="p-2 rounded-full border border-white/5 bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                        <ArrowRight size={16} className="text-white/70" />
                    </div>
                </div>

                <h3 className="text-2xl font-display font-bold mb-3 text-white">
                    {title}
                </h3>
                <p className="text-white/50 leading-relaxed mb-auto">
                    {description}
                </p>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2">
                    <Activity size={14} className="text-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">System Active</span>
                </div>
            </div>
        </Link>
    </motion.div>
);

export default function Dashboard() {
    const { t } = useTranslation();

    const modules = [
        {
            title: t('nav.backlog'),
            icon: IconLayers,
            description: t('dashboard.backlog_desc'),
            to: "/app/backlog",
            color: "#8b5cf6" // Neon Violet
        },
        {
            title: t('nav.workshop'),
            icon: IconLayout,
            description: t('dashboard.workshop_desc'),
            to: "/app/workshop",
            color: "#3b82f6" // Electric Blue
        },
        {
            title: t('nav.command_tower'),
            icon: Zap,
            description: t('dashboard.command_tower_desc'),
            to: "/app/command-tower",
            color: "#f59e0b" // Solar Amber
        }
    ];

    return (
        <div className="min-h-screen py-10">
            <div className="max-w-7xl mx-auto">
                <motion.header
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 pl-2"
                >
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50 mb-4">
                        FLOW STUDIO
                    </h1>
                    <p className="text-xl text-white/40 max-w-2xl font-light">
                        {t('dashboard.subtitle', 'Cultivate your ideas in a space of focused engineering.')}
                    </p>
                </motion.header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {modules.map((mod, idx) => (
                        <ModuleCard key={idx} {...mod} index={idx} />
                    ))}
                </div>
            </div>
        </div>
    );
}
