import React from 'react';

// Specialized highlighter for Input that STRICTLY preserves layout/character-count
// to ensure perfect alignment with the overlaying textarea's cursor.
const highlightText = (text) => {
    if (!text) return null;

    // Split by delimiters: [...] or **...** or `...`
    // Using a more robust regex that handles nested spaces
    const parts = text.split(/(\[.*?\]|\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, index) => {
        if (!part) return null;

        // Tag: [TagName]
        if (part.startsWith('[') && part.endsWith(']')) {
            return (
                <span
                    key={index}
                    className="text-pink-600 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-900/20 rounded-md ring-1 ring-inset ring-pink-100 dark:ring-pink-800/30"
                    style={{
                        fontStyle: 'normal',
                        padding: '0px 0px', // No horizontal padding to affect width
                        margin: '0px 0px',
                    }}
                >
                    {part}
                </span>
            );
        }
        // Bold: **Text** - Just color, NO font-weight change to avoid width drift
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <span key={index} className="text-gray-900 dark:text-gray-100" style={{ fontStyle: 'normal' }}>
                    {part}
                </span>
            );
        }
        // Code: `Code` - Just color
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <span key={index} className="text-pink-600 dark:text-pink-400 bg-gray-50 dark:bg-gray-800/50 rounded" style={{ fontStyle: 'normal' }}>
                    {part}
                </span>
            );
        }
        // Plain text
        return <span key={index} style={{ fontStyle: 'normal' }}>{part}</span>;
    });
};

const InputRichPreview = ({ text, scrollTop }) => {
    const commonStyles = {
        fontFamily: 'inherit',
        lineHeight: '1.625', // Match leading-relaxed
        letterSpacing: 'normal',
        fontVariantLigatures: 'none',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
    };

    return (
        <div
            className="absolute inset-0 p-6 pb-20 pointer-events-none text-lg font-light break-words overflow-hidden text-gray-700 dark:text-gray-200 whitespace-pre-wrap"
            style={{
                ...commonStyles,
                marginTop: `-${scrollTop}px`,
            }}
        >
            {highlightText(text)}
            {text && text.endsWith('\n') && <br />}
        </div>
    );
};

export default InputRichPreview;
