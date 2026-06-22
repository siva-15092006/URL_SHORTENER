import { v4 as uuidv4 } from 'uuid';
import { isShortcodeTaken } from './storage';
import { Log } from 'logging-middleware';

/**
 * Generates a unique, random shortcode (6 alphanumeric characters).
 * Retries on collision (extremely unlikely with uuid, but we guard anyway).
 */
export function generateShortcode() {
  let code;
  let attempts = 0;
  do {
    code = uuidv4().replace(/-/g, '').slice(0, 6);
    attempts++;
  } while (isShortcodeTaken(code) && attempts < 10);

  Log('frontend', 'debug', 'utils', `Generated shortcode ${code} after ${attempts} attempt(s)`);
  return code;
}

/**
 * Validates a user-supplied custom shortcode.
 * Rules: alphanumeric only, 3-20 characters.
 */
export function isValidShortcodeFormat(code) {
  return /^[a-zA-Z0-9]{3,20}$/.test(code);
}