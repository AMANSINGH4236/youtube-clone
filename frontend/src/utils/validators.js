

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password (min 6 characters)
 * @param {string} password
 * @returns {boolean}
 */
export function validatePassword(password) {
  if (typeof password !== "string") return false;
  if (password.length < 6) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[^a-zA-Z0-9]/.test(password)) return false;
  return true;
}

/**
 * Validate username (min 3 characters, alphanumeric + underscore only)
 * @param {string} username
 * @returns {boolean}
 */
export function validateUsername(username) {
  if (typeof username !== "string") return false;
  const trimmed = username.trim();
  return trimmed.length >= 3 && /^[a-zA-Z0-9_]+$/.test(trimmed);
}