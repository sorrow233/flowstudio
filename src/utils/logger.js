/**
 * Centralized Logger Service
 * Controls log visibility based on environment (DEV only by default)
 * and provides utilities for PII masking.
 */

const isDev = import.meta.env.DEV;

export const Logger = {
    info: (module, message, ...args) => {
        if (isDev) {
            console.log(`[${module}] ${message}`, ...args);
        }
    },
    warn: (module, message, ...args) => {
        if (isDev) {
            console.warn(`[${module}] ${message}`, ...args);
        }
    },
    error: (module, message, ...args) => {
        // Always show errors, or strictly DEV? 
        // Showing errors in production is usually helpful for debugging issues that users report,
        // but 'info' logs are noise. Let's allow errors in PROD but keep the prefix.
        console.error(`[${module}] ${message}`, ...args);
    },
    debug: (module, message, ...args) => {
        if (isDev) {
            console.debug(`[${module}] ${message}`, ...args);
        }
    },
    /**
     * Masks an email address for privacy.
     * Example: kang***@gmail.com
     */
    maskEmail: (email) => {
        if (!email || typeof email !== 'string') return '***';
        const parts = email.split('@');
        if (parts.length !== 2) return '***';

        const [name, domain] = parts;
        const maskedName = name.length > 2
            ? `${name.substring(0, 2)}***`
            : `${name}***`;

        return `${maskedName}@${domain}`;
    }
};
