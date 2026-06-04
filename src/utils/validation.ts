/**
 * Validates whether the given string is a correctly formatted email address.
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates whether the given password meets the security requirements.
 * It must be at least 8 characters long.
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};
