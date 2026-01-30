/**
 * HTML Escape Utility
 *
 * Provides functions to escape HTML entities to prevent XSS attacks.
 * All user input displayed in the DOM should be processed through these functions.
 *
 * @module utils/escape
 */

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped safe text
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Recursively escapes all string values in an object
 * @param {Object} obj - Object to escape
 * @returns {Object} Escaped object
 */
function escapeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    const escaped = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            escaped[key] = escapeHtml(value);
        } else if (typeof value === 'object' && value !== null) {
            escaped[key] = escapeObject(value);
        } else {
            escaped[key] = value;
        }
    }
    return escaped;
}

// 导出到全局（浏览器环境）
if (typeof window !== 'undefined') {
    window.EscapeUtils = { escapeHtml, escapeObject };
}

// 导出（Node.js 环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { escapeHtml, escapeObject };
}
