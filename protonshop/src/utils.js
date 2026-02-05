/**
 * Formats a number as Colombian Pesos (COP).
 * @param {number} value - The numeric value to format.
 * @returns {string} - The formatted string (e.g., "$ 1.250.000").
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};
