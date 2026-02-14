import React from 'react';
import WritingBetaV3Header from './components/WritingBetaV3Header';
import WritingBetaV3Editor from './components/WritingBetaV3Editor';
import WritingBetaV3SidePanel from './components/WritingBetaV3SidePanel';
import { useWritingBetaV3Draft } from './hooks/useWritingBetaV3Draft';

const WritingBetaV3Page = () => {
    const {
        title,
        content,
        setTitle,
        setContent,
        metrics,
        lastSavedAt,
        saveState,
        clearDraft,
    } = useWritingBetaV3Draft();

    return (
        <div className="min-h-full py-6 space-y-5">
            <WritingBetaV3Header saveState={saveState} lastSavedAt={lastSavedAt} />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <WritingBetaV3Editor
                        title={title}
                        content={content}
                        onTitleChange={setTitle}
                        onContentChange={setContent}
                        onClear={clearDraft}
                    />
                </div>

                <div className="lg:col-span-4">
                    <WritingBetaV3SidePanel title={title} content={content} metrics={metrics} />
                </div>
            </div>
        </div>
    );
};

export default WritingBetaV3Page;
