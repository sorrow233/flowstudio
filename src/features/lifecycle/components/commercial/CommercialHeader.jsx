import React from 'react';
import { Coins, Terminal } from 'lucide-react';
import { useTranslation } from '../../../i18n';

const CommercialHeader = ({
    isLaunchReady,
    handleCopyCommand,
    commercialProjects,
    selectedProject,
    setSelectedProject
}) => {
    const { t } = useTranslation();

    return (
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-100 dark:border-gray-800 pb-8 gap-6">
            <div>
                <h2 className="text-3xl font-thin text-amber-500 dark:text-amber-400 mb-2 tracking-tight flex items-center gap-3">
                    <span className="text-amber-500"><Coins size={28} strokeWidth={1.5} /></span>
                    {t('commercial.strategy')}
                </h2>
                <p className="text-gray-400 text-sm font-light tracking-wide max-w-xl leading-relaxed">
                    {isLaunchReady
                        ? t('commercial.strategyReadyDesc')
                        : t('commercial.strategyDesc')
                    }
                </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                {/* Copy Command Button */}
                <button
                    onClick={handleCopyCommand}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-lg shadow-gray-200 dark:shadow-none"
                >
                    <Terminal size={14} />
                    {t('commercial.copyDirective')}
                </button>

                {/* Project Selector Tabs */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-1.5 rounded-2xl border border-amber-100 dark:border-amber-900/50 shadow-lg shadow-amber-100/50 dark:shadow-none overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider pl-3 whitespace-nowrap">
                        {t('commercial.project')}:
                    </span>
                    <div className="flex gap-1">
                        {commercialProjects.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedProject(p)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${selectedProject.id === p.id
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-lg shadow-amber-300/50'
                                    : 'bg-white/80 dark:bg-gray-800 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50 hover:bg-white dark:hover:bg-gray-700 hover:border-amber-300'
                                    }`}
                            >
                                {p.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommercialHeader;
