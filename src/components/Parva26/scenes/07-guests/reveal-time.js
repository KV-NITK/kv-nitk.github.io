export const revealTime = (iso) => new Date(`${iso}T00:00:00+05:30`).getTime()

// "2 ದಿನ · 2 days" until the unveiling; hours on the last day.
export function timeLeft(iso, now) {
  const ms = revealTime(iso) - now
  if (ms <= 0) return null
  const hours = Math.ceil(ms / 3_600_000)
  if (hours <= 24) return hours <= 1 ? { kn: 'ಇನ್ನೇನು', en: 'Any minute' } : { kn: `${hours} ಗಂಟೆ`, en: `${hours} hours` }
  const days = Math.ceil(ms / 86_400_000)
  return { kn: `${days} ದಿನ`, en: days === 1 ? '1 day' : `${days} days` }
}
