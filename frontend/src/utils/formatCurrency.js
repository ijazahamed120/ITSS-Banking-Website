/**
 * Currency Formatting Utility for Indian Banking Context (INR)
 */

/**
 * Formats a numeric value into INR currency format using Indian Number Format (en-IN)
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency code (default: INR)
 * @param {object} options - Additional Intl formatting options
 * @returns {string} Formatted currency string (e.g. "₹2,50,000.00" or "₹2,50,000")
 */
export function formatCurrency(amount, currency = 'INR', options = {}) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0.00';

  const defaultOptions = {
    style: 'currency',
    currency: currency === 'USD' ? 'INR' : (currency || 'INR'),
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    ...options,
  };

  try {
    return new Intl.NumberFormat('en-IN', defaultOptions).format(num);
  } catch (e) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
}

/**
 * Formats large amounts into compact Indian terms (Lakh, Crore)
 * @param {number|string} amount
 * @returns {string} (e.g., "₹1.5 Crore", "₹25 Lakh", "₹184 Lakh")
 */
export function formatCompactINR(amount) {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';

  if (num >= 10000000) {
    const crore = (num / 10000000).toFixed(2).replace(/\.00$/, '');
    return `₹${crore} Crore`;
  }
  if (num >= 100000) {
    const lakh = (num / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${lakh} Lakh`;
  }
  return formatCurrency(num);
}
