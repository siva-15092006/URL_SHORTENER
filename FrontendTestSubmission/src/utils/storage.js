import { Log } from 'logging-middleware';

const STORAGE_KEY = 'url_shortener_data';

export function getAllUrls() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveUrl(record) {
  const all = getAllUrls();
  const existingIndex = all.findIndex((u) => u.shortcode === record.shortcode);

  if (existingIndex !== -1) {
    // Reusing an expired shortcode - replace the old record entirely
    all[existingIndex] = record;
    Log('frontend', 'info', 'utils', `Replaced expired shortcode ${record.shortcode} with a new URL`);
  } else {
    all.push(record);
    Log('frontend', 'info', 'utils', `Saved new short URL with shortcode ${record.shortcode}`);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getUrlByShortcode(code) {
  const all = getAllUrls();
  return all.find((u) => u.shortcode === code);
}

export function isShortcodeTaken(code) {
  const existing = getAllUrls().find((u) => u.shortcode === code);
  if (!existing) return false;

  const isExpired = new Date(existing.expiresAt) < new Date();
  return !isExpired;
}

export function recordClick(code, clickData) {
  const all = getAllUrls();
  const record = all.find((u) => u.shortcode === code);
  if (!record) {
    Log('frontend', 'warn', 'utils', `Attempted to record click for unknown shortcode ${code}`);
    return;
  }
  record.clicks.push(clickData);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  Log('frontend', 'info', 'utils', `Recorded click for shortcode ${code}`);
}