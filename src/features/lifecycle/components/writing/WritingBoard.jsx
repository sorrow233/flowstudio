import React, { useState } from 'react';
import WritingSidebar from './WritingSidebar';
import WritingEditor from './WritingEditor';

const WritingBoard = () => {
    const [selectedDocId, setSelectedDocId] = useState('1');

    return (
        <div className="flex h-[calc(100vh-160px)] w-full rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mx-auto max-w-6xl mt-8">
            <WritingSidebar activeDocId={selectedDocId} onSelectDoc={setSelectedDocId} />
            <WritingEditor />
        </div>
    );
};

export default WritingBoard;
