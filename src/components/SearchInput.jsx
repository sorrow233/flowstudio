import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchInput.css';

const SearchInput = ({ value, onChange, placeholder, onClear, className = '' }) => {
    return (
        <div className={`search-input-wrapper ${className}`}>
            <Search size={16} className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button
                    className="search-clear-btn"
                    onClick={onClear}
                    aria-label="Clear search"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
};

export default SearchInput;
