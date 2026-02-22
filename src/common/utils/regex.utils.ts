/**
 * Escapes special characters in a string for use in a regular expression.
 * This helps prevent ReDoS (Regular Expression Denial of Service) attacks.
 */
export const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
