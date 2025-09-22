/**
 * Generate unique 16-character alphanumeric IDs for FoundryVTT compatibility
 */

/**
 * Generate a single 16-character foundry ID
 * @returns {string} - 16 character alphanumeric string
 */
export const generateFoundryId = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate multiple unique foundry IDs
 * @param {number} count - Number of IDs to generate
 * @returns {string[]} - Array of unique 16-character IDs
 */
export const generateUniqueFoundryIds = (count) => {
  const ids = new Set();
  while (ids.size < count) {
    ids.add(generateFoundryId());
  }
  return Array.from(ids);
};

/**
 * Check if a foundry ID is valid format
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid 16-char alphanumeric
 */
export const isValidFoundryId = (id) => {
  return typeof id === 'string' &&
         id.length === 16 &&
         /^[0-9a-z]+$/.test(id);
};