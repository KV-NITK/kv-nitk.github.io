// Checking a typed film name against the answer (Scene 11). Case, spaces,
// punctuation and zero-width joiners don't count, English or Kannada script
// are both fine, and a small typo is forgiven: one wrong letter in a short
// name, two in a long one. TODO(backend): the same check belongs on the
// server, where the answers can't be read.

const clean = (text) =>
  text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[‌‍]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '')

// Edit distance between two strings, by code point.
function distance(a, b) {
  const x = [...a]
  const y = [...b]
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j)
  for (let i = 1; i <= x.length; i++) {
    const row = [i]
    for (let j = 1; j <= y.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1))
    }
    prev = row
  }
  return prev[y.length]
}

export function isRight(guess, puzzle) {
  const g = clean(guess)
  if (!g) return false
  return [puzzle.answer.en, puzzle.answer.kn, ...puzzle.accept].some((option) => {
    const t = clean(option)
    const allowed = t.length > 9 ? 2 : t.length > 4 ? 1 : 0
    return t === g || distance(g, t) <= allowed
  })
}
