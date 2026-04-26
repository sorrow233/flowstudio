import React, { useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import InspirationItem from './InspirationItem';
import { getTodoAiAssistClass } from './todoAiAssistUtils';
import { formatTodoDayLabel, splitIdeasByRecencyAndWeek } from './inspirationListUtils';

const InspirationIdeaList = ({
    selectedCategory,
    sortedIdeas,
    todosByDay,
    visibleIdeaCount,
    allProjects,
    categoryConfigList,
    selectedCategoryDividerLineStyle,
    selectedCategoryDividerTextStyle,
    copiedId,
    isSelectionMode,
    selectedIdeaIdSet,
    isIOS,
    t,
    onRemove,
    onCopy,
    onUpdateColor,
    onUpdateNote,
    onUpdateContent,
    onToggleComplete,
    onToggleSelect,
}) => {
    const { recentIdeas, weeklyIdeaGroups } = useMemo(
        () => splitIdeasByRecencyAndWeek(sortedIdeas),
        [sortedIdeas]
    );

    const renderIdeaItem = useCallback((idea, options = {}) => (
        <InspirationItem
            key={idea.id}
            idea={idea}
            allProjects={allProjects}
            categories={categoryConfigList}
            onDelete={onRemove}
            onCopy={onCopy}
            onUpdateColor={onUpdateColor}
            onUpdateNote={onUpdateNote}
            onUpdateContent={onUpdateContent}
            onToggleComplete={onToggleComplete}
            copiedId={copiedId}
            isSelectionMode={isSelectionMode}
            isSelected={selectedIdeaIdSet.has(idea.id)}
            onSelect={onToggleSelect}
            isTodoView={options.isTodoView}
            aiAssistClass={options.isTodoView ? getTodoAiAssistClass(idea) : undefined}
            isIOSSelectionUi={isIOS}
        />
    ), [
        allProjects,
        categoryConfigList,
        copiedId,
        isIOS,
        isSelectionMode,
        onCopy,
        onRemove,
        onToggleComplete,
        onToggleSelect,
        onUpdateColor,
        onUpdateContent,
        onUpdateNote,
        selectedIdeaIdSet,
    ]);

    return (
        <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-6"
        >
            {selectedCategory === 'todo' && todosByDay.length > 0 && (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {todosByDay.map((day) => (
                            <section
                                key={day.dateKey}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-3 mb-4 mt-6">
                                    <div
                                        className="h-px flex-1"
                                        style={selectedCategoryDividerLineStyle}
                                    />
                                    <span
                                        className="text-xs font-medium tracking-wide whitespace-nowrap"
                                        style={selectedCategoryDividerTextStyle}
                                    >
                                        {formatTodoDayLabel(day.date)}
                                    </span>
                                    <div
                                        className="h-px flex-1"
                                        style={selectedCategoryDividerLineStyle}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {day.ideas.map((idea) => renderIdeaItem(idea, { isTodoView: true }))}
                                    </AnimatePresence>
                                </div>
                            </section>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {selectedCategory !== 'todo' && (
                <>
                    <div className="space-y-6">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {recentIdeas.map((idea) => renderIdeaItem(idea))}
                        </AnimatePresence>
                    </div>

                    {weeklyIdeaGroups.map((week) => (
                        <div key={week.start.getTime()} id={`week-${week.key}`}>
                            <div className="flex items-center gap-3 mb-4 mt-8 cursor-pointer group">
                                <div
                                    className="h-px flex-1 transition-opacity group-hover:opacity-90"
                                    style={selectedCategoryDividerLineStyle}
                                />
                                <span
                                    className="text-xs font-medium tracking-wide whitespace-nowrap transition-opacity group-hover:opacity-90"
                                    style={selectedCategoryDividerTextStyle}
                                >
                                    {week.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    {' - '}
                                    {week.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                                <div
                                    className="h-px flex-1 transition-opacity group-hover:opacity-90"
                                    style={selectedCategoryDividerLineStyle}
                                />
                            </div>
                            <div className="space-y-6">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {week.ideas.map((idea) => renderIdeaItem(idea))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </>
            )}

            {visibleIdeaCount === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-32 text-center"
                >
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lightbulb className="text-gray-300 dark:text-gray-600" size={24} />
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-light tracking-wide">
                        {t('inspiration.emptyState')}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default React.memo(InspirationIdeaList);
