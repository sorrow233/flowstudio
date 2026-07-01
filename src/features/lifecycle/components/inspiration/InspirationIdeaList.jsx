import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import InspirationItem from './InspirationItem';
import { getTodoAiAssistClass, getTodoConflictClass } from './todoAiAssistUtils';
import {
    formatTodoDayLabel,
    limitRecentAndWeeklyIdeaGroups,
    limitTodoDayGroups,
    splitIdeasByRecencyAndWeek,
} from './inspirationListUtils';
import { getIdeaSubcategoryValue } from './inspirationSubcategoryUtils';
import { useProgressiveIdeaRender } from './useProgressiveIdeaRender';

const InspirationIdeaList = ({
    selectedCategory,
    renderScopeKey,
    sortedIdeas,
    todosByDay,
    visibleIdeaCount,
    categoryConfigList,
    selectedCategoryDividerLineStyle,
    selectedCategoryDividerTextStyle,
    copiedId,
    isSelectionMode,
    selectedIdeaIdSet,
    subcategoryOptions = [],
    selectedCategorySubcategories = [],
    isIOS,
    t,
    onRemove,
    onCopy,
    onUpdateColor,
    onUpdateNote,
    onUpdateContent,
    onToggleComplete,
    onToggleSelect,
    onSetSubcategory,
}) => {
    const { recentIdeas, weeklyIdeaGroups } = useMemo(
        () => splitIdeasByRecencyAndWeek(sortedIdeas),
        [sortedIdeas]
    );
    const ideaFingerprint = `${visibleIdeaCount}:${sortedIdeas[0]?.id || 'none'}:${sortedIdeas[sortedIdeas.length - 1]?.id || 'none'}`;
    const progressiveListKey = `${renderScopeKey || selectedCategory}:${ideaFingerprint}`;
    const {
        hasMore,
        renderLimit,
        sentinelRef,
    } = useProgressiveIdeaRender({
        listKey: progressiveListKey,
        totalCount: visibleIdeaCount,
    });
    const visibleTodosByDay = useMemo(
        () => limitTodoDayGroups(todosByDay, renderLimit),
        [renderLimit, todosByDay]
    );
    const { visibleRecentIdeas, visibleWeeklyIdeaGroups } = useMemo(
        () => limitRecentAndWeeklyIdeaGroups({
            recentIdeas,
            weeklyIdeaGroups,
            limit: renderLimit,
        }),
        [recentIdeas, renderLimit, weeklyIdeaGroups]
    );

    const renderIdeaItem = useCallback((idea, options = {}) => (
        <InspirationItem
            key={idea.id}
            idea={idea}
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
            conflictClass={options.isTodoView ? getTodoConflictClass(idea) : undefined}
            subcategoryOptions={subcategoryOptions}
            subcategoryValue={getIdeaSubcategoryValue(idea, selectedCategorySubcategories)}
            showSubcategoryControls={subcategoryOptions.length > 0}
            onSetSubcategory={onSetSubcategory}
            isIOSSelectionUi={isIOS}
            enableEntranceAnimation={false}
        />
    ), [
        categoryConfigList,
        copiedId,
        isIOS,
        isSelectionMode,
        onCopy,
        onRemove,
        onSetSubcategory,
        onToggleComplete,
        onToggleSelect,
        onUpdateColor,
        onUpdateContent,
        onUpdateNote,
        selectedIdeaIdSet,
        selectedCategorySubcategories,
        subcategoryOptions,
    ]);

    return (
        <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="space-y-6"
        >
            {selectedCategory === 'todo' && visibleTodosByDay.length > 0 && (
                <div className="space-y-4">
                    {visibleTodosByDay.map((day) => (
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
                                {day.ideas.map((idea) => renderIdeaItem(idea, { isTodoView: true }))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {selectedCategory !== 'todo' && (
                <>
                    <div className="space-y-6">
                        {visibleRecentIdeas.map((idea) => renderIdeaItem(idea))}
                    </div>

                    {visibleWeeklyIdeaGroups.map((week) => (
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
                                {week.ideas.map((idea) => renderIdeaItem(idea))}
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

            {hasMore && (
                <div
                    ref={sentinelRef}
                    className="flex h-12 items-center justify-center"
                    aria-hidden="true"
                >
                    <span className="h-1 w-10 rounded-full bg-gray-100 dark:bg-gray-800" />
                </div>
            )}
        </motion.div>
    );
};

export default React.memo(InspirationIdeaList);
