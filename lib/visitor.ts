'use client';

import { useSyncExternalStore } from 'react';

// Device-only state (spec §4): which objects were seen and which tour is active.
// No personal data, nothing leaves the device.
const SEEN_KEY = 'orkened:sett';
const TOUR_KEY = 'orkened:rundtur';
const EVENT = 'orkened:visitor';

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private mode or storage disabled: the guide still works, it just forgets.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}

const getSeenRaw = () => read(SEEN_KEY) ?? '';
const getTourRaw = () => read(TOUR_KEY);

const parseSeen = (raw: string) => raw.split(',').filter(Boolean).map(Number);

/** `null` during server render and hydration, so callers can avoid flashing the wrong state. */
export function useSeen(): number[] | null {
  const raw = useSyncExternalStore(subscribe, getSeenRaw, () => null);
  return raw === null ? null : parseSeen(raw);
}

export function markSeen(n: number) {
  const seen = parseSeen(getSeenRaw());
  if (!seen.includes(n)) write(SEEN_KEY, [...seen, n].join(','));
}

/** Active tour slug; `undefined` before hydration, `null` when no tour is active. */
export function useActiveTour(): string | null | undefined {
  return useSyncExternalStore(subscribe, getTourRaw, () => undefined);
}

export const startTour = (slug: string) => write(TOUR_KEY, slug);
export const endTour = () => write(TOUR_KEY, null);
