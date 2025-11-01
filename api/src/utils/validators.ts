import { body } from 'express-validator';

export const signupValidation = [
  body('email').isEmail().withMessage('Por favor ingresa un email válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('name').notEmpty().withMessage('El nombre es requerido'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Por favor ingresa un email válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

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
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Validates that a slug doesn't contain spaces
 * @param slug - The slug to validate
 * @returns Error message if invalid, null if valid
 */
export function validateSlugFormat(slug: string): string | null {
  if (!slug) return null; // Empty slugs are handled by required validation
  
  // Check for any whitespace characters
  if (/[\s\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/.test(slug)) {
    return 'Slug cannot contain spaces. Use hyphens (-) instead (e.g., "this-word-ending")';
  }
  
  return null;
}
