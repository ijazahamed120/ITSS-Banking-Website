import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes conditionally
 * @param {...any} inputs - Class names, objects, or arrays
 * @returns {string} Merged class names string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
