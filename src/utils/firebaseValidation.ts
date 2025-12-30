// Firebase key validation utilities

export const INVALID_FIREBASE_CHARS = ['.', '#', '$', '/', '[', ']'];

/**
 * Check if a string contains invalid Firebase key characters
 */
export const hasInvalidFirebaseChars = (text: string): boolean => {
  return INVALID_FIREBASE_CHARS.some(char => text.includes(char));
};

/**
 * Get list of invalid characters found in a string
 */
export const getInvalidChars = (text: string): string[] => {
  return INVALID_FIREBASE_CHARS.filter(char => text.includes(char));
};

/**
 * Sanitize a string to be Firebase-safe by replacing invalid characters
 */
export const sanitizeFirebaseKey = (key: string): string => {
  if (!key || typeof key !== 'string') return '';
  
  let sanitized = key.trim();
  
  // Replace invalid characters with underscores
  INVALID_FIREBASE_CHARS.forEach(char => {
    sanitized = sanitized.replace(new RegExp(`\\${char}`, 'g'), '_');
  });
  
  // Remove multiple consecutive underscores
  sanitized = sanitized.replace(/_+/g, '_');
  
  // Remove leading/trailing underscores
  sanitized = sanitized.replace(/^_+|_+$/g, '');
  
  // Ensure it's not empty
  return sanitized || 'requirement';
};

/**
 * Validate if a string is a valid Firebase key
 */
export const isValidFirebaseKey = (key: string): boolean => {
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return false;
  }
  
  return !hasInvalidFirebaseChars(key);
};

/**
 * Get validation error message for invalid Firebase key
 */
export const getFirebaseKeyError = (key: string): string | null => {
  if (!key || key.trim() === '') {
    return 'Requirement name cannot be empty';
  }
  
  const invalidChars = getInvalidChars(key);
  if (invalidChars.length > 0) {
    return `Cannot contain these characters: ${invalidChars.join(', ')}`;
  }
  
  return null;
};