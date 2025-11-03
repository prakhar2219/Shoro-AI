import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a slug string by:
 * - Trimming whitespace
 * - Converting all spaces (including Unicode spaces) to hyphens
 * - Removing URL problematic characters (#?&%=+)
 * - Converting multiple consecutive hyphens to single hyphen
 * - Removing leading/trailing hyphens
 * - Preserving Unicode characters for multilingual support
 * 
 * @param value - The input string to format as a slug
 * @returns Formatted slug string (e.g., "this-word-ending")
 */
export function formatSlug(value: string): string {
  if (!value) return '';
  
  return value
    .trim()
    // Replace all whitespace characters (including Unicode spaces) with hyphens
    .replace(/[\s\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]+/g, '-')
    // Remove URL problematic characters
    .replace(/[#?&%=+]/g, '')
    // Keep Unicode letters/numbers; we only remove known problematic URL chars above
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}
