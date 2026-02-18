import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    WRITING_FONT_OPTIONS,
    WRITING_TYPOGRAPHY_DEFAULTS,
    WRITING_TYPOGRAPHY_LIMITS,
    WRITING_TYPOGRAPHY_STORAGE_KEY,
} from '../writingTypographyConfig';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const sanitizeNumericField = (key, value) => {
    const fallback = WRITING_TYPOGRAPHY_DEFAULTS[key];
    const limits = WRITING_TYPOGRAPHY_LIMITS[key];
    const parsed = typeof value === 'number' ? value : Number.parseFloat(value);

    if (!limits || !Number.isFinite(parsed)) {
        return fallback;
    }

    return clamp(parsed, limits.min, limits.max);
};

const normalizeTypography = (rawValue) => {
    if (!rawValue || typeof rawValue !== 'object') {
        return WRITING_TYPOGRAPHY_DEFAULTS;
    }

    const fontExists = WRITING_FONT_OPTIONS.some((option) => option.id === rawValue.fontId);

    return {
        fontId: fontExists ? rawValue.fontId : WRITING_TYPOGRAPHY_DEFAULTS.fontId,
        lineHeight: sanitizeNumericField('lineHeight', rawValue.lineHeight),
        paragraphSpacing: sanitizeNumericField('paragraphSpacing', rawValue.paragraphSpacing),
        lineWidth: sanitizeNumericField('lineWidth', rawValue.lineWidth),
        firstLineIndent: sanitizeNumericField('firstLineIndent', rawValue.firstLineIndent),
        h1Size: sanitizeNumericField('h1Size', rawValue.h1Size),
        h2Size: sanitizeNumericField('h2Size', rawValue.h2Size),
        h3Size: sanitizeNumericField('h3Size', rawValue.h3Size),
        bodySize: sanitizeNumericField('bodySize', rawValue.bodySize),
        tableSize: sanitizeNumericField('tableSize', rawValue.tableSize),
    };
};

const loadSavedTypography = () => {
    if (typeof window === 'undefined') {
        return WRITING_TYPOGRAPHY_DEFAULTS;
    }

    try {
        const raw = window.localStorage.getItem(WRITING_TYPOGRAPHY_STORAGE_KEY);
        if (!raw) return WRITING_TYPOGRAPHY_DEFAULTS;
        return normalizeTypography(JSON.parse(raw));
    } catch (error) {
        console.warn('Failed to load writing typography settings:', error);
        return WRITING_TYPOGRAPHY_DEFAULTS;
    }
};

export const useWritingTypography = () => {
    const [typography, setTypography] = useState(loadSavedTypography);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            window.localStorage.setItem(WRITING_TYPOGRAPHY_STORAGE_KEY, JSON.stringify(typography));
        } catch (error) {
            console.warn('Failed to save writing typography settings:', error);
        }
    }, [typography]);

    const setTypographyField = useCallback((field, nextValue) => {
        setTypography((current) => {
            if (field === 'fontId') {
                const fontExists = WRITING_FONT_OPTIONS.some((option) => option.id === nextValue);
                return {
                    ...current,
                    fontId: fontExists ? nextValue : current.fontId,
                };
            }

            if (!Object.prototype.hasOwnProperty.call(WRITING_TYPOGRAPHY_LIMITS, field)) {
                return current;
            }

            const sanitized = sanitizeNumericField(field, nextValue);
            return {
                ...current,
                [field]: sanitized,
            };
        });
    }, []);

    const resetTypography = useCallback(() => {
        setTypography(WRITING_TYPOGRAPHY_DEFAULTS);
    }, []);

    const fontOption = useMemo(
        () => WRITING_FONT_OPTIONS.find((option) => option.id === typography.fontId) || WRITING_FONT_OPTIONS[0],
        [typography.fontId],
    );

    const editorStyleVars = useMemo(
        () => ({
            '--writing-font-family': fontOption.stack,
            '--writing-line-height': `${typography.lineHeight}`,
            '--writing-paragraph-gap': `${typography.paragraphSpacing}em`,
            '--writing-line-width': `${typography.lineWidth}`,
            '--writing-first-indent': `${typography.firstLineIndent}em`,
            '--writing-h1-size': `${typography.h1Size}px`,
            '--writing-h2-size': `${typography.h2Size}px`,
            '--writing-h3-size': `${typography.h3Size}px`,
            '--writing-body-size': `${typography.bodySize}px`,
            '--writing-table-size': `${typography.tableSize}px`,
        }),
        [fontOption.stack, typography],
    );

    return {
        typography,
        fontOptions: WRITING_FONT_OPTIONS,
        fieldLimits: WRITING_TYPOGRAPHY_LIMITS,
        editorStyleVars,
        fontStack: fontOption.stack,
        setTypographyField,
        resetTypography,
    };
};

export default useWritingTypography;
