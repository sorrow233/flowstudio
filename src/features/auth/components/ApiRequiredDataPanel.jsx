import React from 'react';
import IdentityFieldCard from './IdentityFieldCard';

const ApiRequiredDataPanel = ({
    onCopyBundle,
    copyStatus,
    copiedKey
}) => {
    return (
        <div className="mt-7 rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm p-4 md:p-5">
            <div>
                <IdentityFieldCard
                    label="API 必备数据"
                    value=""
                    hideValue
                    copyable
                    isCopied={copyStatus === 'success' && copiedKey === 'apiBundle'}
                    onCopy={onCopyBundle}
                />
            </div>
        </div>
    );
};

export default ApiRequiredDataPanel;
