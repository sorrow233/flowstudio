import React from 'react';

// Specialized highlighter for Input that STRICTLY preserves layout/character-count
// to ensure perfect alignment with the overlaying textarea's cursor.
const highlightText = (text) => {
    if (!text) return null;

    // Split by delimiters but keep them in the parts
    // Regex: Capture ([...]) OR (**...**) OR (`...`)
    const parts = text.split(/(\[[^\]]+\]|\*\*[^*]+\*\*|`[^`]+`)/g);

    return parts.map((part, index) => {
        // Tag: [TagName] - Keep brackets, just color it
        if (part.startsWith('[') && part.endsWith(']')) {
            return (
                <span key={index} className="text-pink-500">
                    {part}
                </span>
            );
        }
        // Bold: **Text** - Just color, NO font-weight change to avoid width drift
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <span key={index} className="text-gray-900 dark:text-gray-100">
                    {part}
                </span>
            );
        }
        // Code: `Code` - Just color
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <span key={index} className="text-pink-600 dark:text-pink-400">
                    {part}
                </span>
            );
        }
        // Plain text
        return <span key={index}>{part}</span>;
    });
};

const InputRichPreview = ({ text, scrollTop }) => {
    return (
        <div
            className="absolute inset-0 p-6 pb-20 pointer-events-none text-lg leading-relaxed whitespace-pre-wrap font-light break-words overflow-hidden text-gray-700 dark:text-gray-200"
            style={{
                marginTop: `-${scrollTop}px`,
                fontFamily: 'inherit',
            }}
        >
            {highlightText(text)}
            {text && text.endsWith('\n') && <br />}
        </div>
    );
};

export default InputRichPreview;
