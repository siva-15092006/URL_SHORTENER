/**
 * Checks whether a string is a well-formed URL.
 */
export function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks whether a validity value is a positive integer.
 */
export function isValidValidityMinutes(value) {
  if (value === '' || value === null || value === undefined) return true; // optional field
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}