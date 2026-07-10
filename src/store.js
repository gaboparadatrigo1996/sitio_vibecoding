import { CAPTURED_STORAGE_KEY } from './constants.js';

function saveCapturedIds(ids) {
  localStorage.setItem(CAPTURED_STORAGE_KEY, JSON.stringify(ids));
}

export function getCapturedIds() {
  const raw = localStorage.getItem(CAPTURED_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value) => Number.isInteger(value));
  } catch {
    return [];
  }
}

export function isCaptured(id) {
  return getCapturedIds().includes(Number(id));
}

export function capturePokemon(id) {
  const numericId = Number(id);
  const captured = getCapturedIds();
  if (captured.includes(numericId)) {
    return captured;
  }

  const next = [...captured, numericId];
  saveCapturedIds(next);
  return next;
}

export function releasePokemon(id) {
  const numericId = Number(id);
  const next = getCapturedIds().filter((capturedId) => capturedId !== numericId);
  saveCapturedIds(next);
  return next;
}
