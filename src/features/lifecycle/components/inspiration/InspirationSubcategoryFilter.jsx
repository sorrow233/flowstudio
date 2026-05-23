import React from 'react';
import { Layers2 } from 'lucide-react';
import { hexToRgba } from './categoryThemeUtils';

const InspirationSubcategoryFilter = ({
    options = [],
    selectedValue,
    accentHex = '#ec4899',
    onSelect,
}) => {
    if (!Array.isArray(options) || options.length <= 2) return null;

    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border text-gray-400 dark:text-gray-500"
                style={{
                    borderColor: hexToRgba(accentHex, 0.2),
                    backgroundColor: hexToRgba(accentHex, 0.06),
                }}
                title="当前大分类的子分类"
            >
                <Layers2 size={13} />
            </div>

            {options.map((option) => {
                const isActive = selectedValue === option.value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onSelect?.(option.value)}
                        className="flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                        style={isActive
                            ? {
                                color: '#fff',
                                borderColor: accentHex,
                                backgroundColor: accentHex,
                                boxShadow: `0 10px 22px -18px ${hexToRgba(accentHex, 0.85)}`,
                            }
                            : {
                                color: accentHex,
                                borderColor: hexToRgba(accentHex, 0.22),
                                backgroundColor: hexToRgba(accentHex, 0.07),
                            }}
                        title={`查看 ${option.label}`}
                    >
                        {option.label}
                        <span
                            className="ml-1.5"
                            style={{ opacity: isActive ? 0.86 : 0.7 }}
                        >
                            {option.count || 0}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default React.memo(InspirationSubcategoryFilter);
