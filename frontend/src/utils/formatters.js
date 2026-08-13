import { formatCurrency, formatCompactINR } from './formatCurrency.js';

export { formatCurrency, formatCompactINR };

/**
 * Formats a date string or timestamp into readable date-time format
 * @param {string|Date} date - Date object or ISO string
 * @param {boolean} includeTime - Whether to include time in output
 * @returns {string} Formatted date string (e.g. "Aug 10, 2026, 09:30 AM")
 */
export function formatDate(date, includeTime = true) {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  };

  return new Intl.DateTimeFormat('en-US', options).format(d);
}

/**
 * Masks sensitive account numbers showing only the last 4 digits
 * @param {string} accountNumber - Full account number
 * @returns {string} Masked account string (e.g. "•••• 4892")
 */
export function maskAccountNumber(accountNumber) {
  if (!accountNumber) return '•••• ----';
  const str = String(accountNumber).trim();
  if (str.length <= 4) return str;
  const lastFour = str.slice(-4);
  return `•••• ${lastFour}`;
}

/**
 * Formats a plain number with thousand separators
 * @param {number|string} value - Number to format
 * @returns {string} Formatted number string (e.g. "1,250,000")
 */
export function formatNumber(value) {
  const num = Number(value);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Formats a decimal ratio into a percentage string
 * @param {number} decimal - Decimal ratio (e.g. 0.145)
 * @param {number} decimals - Precision places
 * @returns {string} Percentage string (e.g. "14.5%")
 */
export function formatPercentage(decimal, decimals = 1) {
  const num = Number(decimal);
  if (isNaN(num)) return '0%';
  return `${(num * 100).toFixed(decimals)}%`;
}
