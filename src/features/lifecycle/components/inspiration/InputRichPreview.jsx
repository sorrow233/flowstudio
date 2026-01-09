import React from 'react';
import { parseRichText } from './InspirationItem'; // Reuse the parser

// Rich input preview to render tags in textarea
const InputRichPreview = ({ text, scrollTop }) => {
    return (
        <div
            className="absolute inset-0 p-6 pb-20 pointer-events-none text-lg leading-relaxed whitespace-pre-wrap font-light break-words overflow-hidden text-gray-800 dark:text-gray-100 opacity-100"
            style={{
                marginTop: `-${scrollTop}px`, // Sync scroll by shifting content
            }}
        >
            {parseRichText(text)}
        </div>
    );
};

export default InputRichPreview;
