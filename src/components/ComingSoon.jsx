import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Hammer, ExternalLink, Bell } from 'lucide-react';

const ComingSoon = ({
    title = "Under Construction",
    description = "This feature is currently being built.",
    icon: Icon = Hammer,
    color = "emerald",
    features = []
}) => {

    // Color mapping
    const colorStyles = {
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'focus:ring-emerald-200' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'focus:ring-blue-200' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'focus:ring-purple-200' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'focus:ring-amber-200' },
    };
    const style = colorStyles[color] || colorStyles.emerald;

    return (
        <div className="max-w-3xl mx-auto pt-10 px-6">
            <div className="mb-12">
                <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-tight flex items-center gap-3">
                    <div className={`w-10 h-10 ${style.bg} ${style.text} rounded-xl flex items-center justify-center`}>
                        <Icon size={20} />
                    </div>
                    {title}
                </h2>
                <p className="text-gray-400 text-sm font-light tracking-wide pl-14">
                    {description}
                </p>
            </div>

            <div className="relative border border-dashed border-gray-200 rounded-[2rem] p-12 overflow-hidden bg-gray-50/30">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white to-transparent opacity-50 rounded-bl-[4rem]" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="mb-8 p-6 bg-white rounded-full shadow-lg shadow-gray-200"
                    >
                        <Clock size={48} className="text-gray-300" strokeWidth={1} />
                    </motion.div>

                    <h3 className="text-xl font-medium text-gray-900 mb-2">Coming Soon</h3>
                    <p className="text-gray-500 font-light max-w-md mx-auto mb-10 leading-relaxed">
                        We are crafting this module with pixel-perfect precision.
                        Here is a sneak peek at what's coming:
                    </p>

                    {features.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mb-10">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                        <div className={`w-2 h-2 rounded-full ${style.bg.replace('bg-', 'bg-').replace('50', '400')}`} />
                                    </div>
                                    <span className="text-sm text-gray-600 font-light">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button className={`px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2`}>
                            <Bell size={16} /> Notify Me
                        </button>
                        <button className={`px-6 py-2.5 ${style.bg} ${style.text} rounded-xl text-sm font-medium hover:brightness-95 transition-all shadow-sm flex items-center gap-2`}>
                            View Roadmap <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
