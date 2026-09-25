import { useEffect, useState } from 'react'

// Remembering things in this browser. Storage can be missing or blocked
// (private windows, strict settings), so every access is guarded and the
// page works the same without it. Values are stored as JSON.
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore: it just won't be remembered
  }
}

// State remembered between visits. When `key` changes (a new day's game,
// say), the state is read again for the new key.
export function useStoredState(key, initial) {
  const [state, setState] = useState(() => load(key, initial))
  const [shownKey, setShownKey] = useState(key)
  if (key !== shownKey) {
    setShownKey(key)
    setState(load(key, initial))
  }
  useEffect(() => save(key, state), [key, state])
  return [state, setState]
}
