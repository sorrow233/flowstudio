import i18n from '../i18n';

/**
 * Formats a date string or object according to the current locale.
 * @param {string|Date} date - The date to format.
 * @param {Intl.DateTimeFormatOptions} options - Formatting options.
 * @returns {string} Formatted date string.
 */
export const formatDate = (date, options = {}) => {
    const locale = i18n.language || 'en';
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Default options if none provided
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
};

/**
 * Formats a number as currency according to the current locale.
 * @param {number} amount - The amount to format.
 * @param {string} currency - The currency code (e.g., 'USD', 'CNY', 'JPY'). 
 *                            If not provided, defaults based on locale is hard, so better to pass it or default to USD.
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount, currency = 'USD') => {
    const locale = i18n.language || 'en';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
};
