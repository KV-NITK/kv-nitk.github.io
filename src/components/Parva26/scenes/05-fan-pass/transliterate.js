// English-typed names to Kannada script, in the browser (spec, Scene 5).
// A name typed in English letters can be written several ways in Kannada
// (a or ಆ? t or ಟ? n or ಣ?), so this returns a few likely spellings, best
// first, for the visitor to choose from or edit. It is rule-based: good for
// most Indian names, rough for the rest, which is why editing matters.
// A server model (IndicXlit) can replace it later without changing callers.

const VIRAMA = '್'
const ANUSVARA = 'ಂ'

// Vowels: [independent letter, sign after a consonant]
const V = {
  a: ['ಅ', ''],
  aa: ['ಆ', 'ಾ'],
  i: ['ಇ', 'ಿ'],
  ii: ['ಈ', 'ೀ'],
  u: ['ಉ', 'ು'],
  uu: ['ಊ', 'ೂ'],
  e: ['ಎ', 'ೆ'],
  ee: ['ಏ', 'ೇ'],
  ai: ['ಐ', 'ೈ'],
  o: ['ಒ', 'ೊ'],
  oo: ['ಓ', 'ೋ'],
  au: ['ಔ', 'ೌ'],
  ru: ['ಋ', 'ೃ'],
}

// Spelled vowel → possible sounds, most likely first.
const VOWELS = [
  ['aa', ['aa']],
  ['ai', ['ai']],
  ['au', ['au']],
  ['ou', ['au']],
  ['ee', ['ii', 'ee']],
  ['ii', ['ii']],
  ['oo', ['uu', 'oo']],
  ['uu', ['uu']],
  ['a', ['a', 'aa']],
  ['i', ['i', 'ii']],
  ['u', ['u', 'uu']],
  ['e', ['ee', 'e']],
  ['o', ['oo', 'o']],
]

// Spelled consonant → possible letters, most likely first.
const CONSONANTS = [
  ['ksh', ['ಕ್ಷ']],
  ['chh', ['ಚ್ಛ', 'ಛ']],
  ['sh', ['ಶ', 'ಷ']],
  ['ch', ['ಚ']],
  ['kh', ['ಖ']],
  ['gh', ['ಘ']],
  ['jh', ['ಝ']],
  ['th', ['ತ', 'ಥ']],
  ['dh', ['ಧ']],
  ['ph', ['ಫ']],
  ['bh', ['ಭ']],
  ['k', ['ಕ']],
  ['c', ['ಕ']],
  ['q', ['ಕ']],
  ['g', ['ಗ']],
  ['j', ['ಜ']],
  ['z', ['ಜ']],
  ['t', ['ತ', 'ಟ']],
  ['d', ['ದ', 'ಡ']],
  ['n', ['ನ', 'ಣ']],
  ['p', ['ಪ']],
  ['f', ['ಫ']],
  ['b', ['ಬ']],
  ['m', ['ಮ']],
  ['y', ['ಯ']],
  ['r', ['ರ']],
  ['l', ['ಲ', 'ಳ']],
  ['v', ['ವ']],
  ['w', ['ವ']],
  ['s', ['ಸ']],
  ['h', ['ಹ']],
  ['x', ['ಕ್ಸ']],
]

const STOPS = new Set(['k', 'c', 'q', 'kh', 'g', 'gh', 'ch', 'chh', 'j', 'jh', 't', 'th', 'd', 'dh', 'p', 'ph', 'b', 'bh', 'f'])

function match(table, s, i) {
  for (const [key, options] of table) if (s.startsWith(key, i)) return [key, options]
  return null
}

// Splits a word into sounds, each with its possible spellings.
function tokenize(word) {
  const tokens = []
  let i = 0
  while (i < word.length) {
    // A trailing y after a consonant is a vowel: Sunny, Shetty.
    if (word[i] === 'y' && i === word.length - 1 && tokens.length && tokens.at(-1).type === 'c') {
      tokens.push({ type: 'v', key: 'y', options: ['i', 'ii'] })
      i++
      continue
    }
    const v = match(VOWELS, word, i)
    if (v) {
      tokens.push({ type: 'v', key: v[0], options: v[1] })
      i += v[0].length
      continue
    }
    const c = match(CONSONANTS, word, i)
    if (c) {
      tokens.push({ type: 'c', key: c[0], options: c[1] })
      i += c[0].length
      continue
    }
    i++ // anything else (digits, punctuation) is dropped
  }
  // Common shapes in names get their likely alternatives:
  tokens.forEach((tok, k) => {
    const next = tokens[k + 1]
    const after = tokens[k + 2]
    // A final "a" is often long in names (Priya → ಪ್ರಿಯಾ) or short (Krishna).
    if (tok.type === 'v' && tok.key === 'a' && k === tokens.length - 1 && k > 0) tok.options = ['a', 'aa']
    // "ar" before a consonant is often long: Karthik → ಕಾರ್ತಿಕ್
    if (tok.type === 'v' && tok.key === 'a' && next?.key === 'r' && after?.type === 'c') tok.options = ['aa', 'a']
    // n or m before a stop becomes the anusvara: Sandeep → ಸಂದೀಪ್
    if (tok.type === 'c' && (tok.key === 'n' || tok.key === 'm') && next?.type === 'c' && STOPS.has(next.key)) {
      tok.options = [ANUSVARA, ...tok.options]
      tok.nasal = true
    }
    // "ri" after a consonant can be the vowel ಋ: Krishna → ಕೃಷ್ಣ
    if (tok.type === 'c' && tok.key === 'r' && next?.key === 'i' && k > 0 && tokens[k - 1].type === 'c') tok.ri = true
  })
  return tokens
}

// Builds the Kannada for one choice of spelling per sound.
function render(tokens, picks) {
  let out = ''
  for (let k = 0; k < tokens.length; k++) {
    const tok = tokens[k]
    const pick = tok.options[picks[k]]
    const prev = tokens[k - 1]
    if (tok.type === 'v') {
      if (tok.skip) continue
      const [letter, sign] = V[pick]
      out += prev && prev.type === 'c' && !prev.isNasal ? sign : letter
      continue
    }
    tok.isNasal = pick === ANUSVARA
    if (tok.isNasal) {
      out += ANUSVARA
      continue
    }
    const next = tokens[k + 1]
    out += pick
    if (!next || next.type === 'c') out += VIRAMA
  }
  return out
}

// Up to `limit` spellings for a name, most likely first.
export function kannadaSpellings(name, limit = 4) {
  const words = name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, ''))
    .filter(Boolean)
  if (!words.length) return []

  const perWord = words.map((word) => {
    const tokens = tokenize(word)
    // Choices ranked by how many less-likely spellings they use, then by
    // where: changes near the end of a name are more common (final a, n).
    const ambiguous = tokens.map((t, i) => [t, i]).filter(([t]) => t.options.length > 1).map(([, i]) => i)
    const found = []
    const seen = new Set()
    const tryPicks = (picks) => {
      const text = render(tokens, picks)
      if (text && !seen.has(text)) {
        seen.add(text)
        found.push(text)
      }
    }
    tryPicks(tokens.map(() => 0))
    // One alternative at a time, latest first
    for (const i of [...ambiguous].reverse()) {
      const picks = tokens.map(() => 0)
      picks[i] = 1
      tryPicks(picks)
    }
    // Then pairs
    for (let a = ambiguous.length - 1; a >= 0; a--) {
      for (let b = a - 1; b >= 0; b--) {
        const picks = tokens.map(() => 0)
        picks[ambiguous[a]] = 1
        picks[ambiguous[b]] = 1
        tryPicks(picks)
      }
    }
    return found
  })

  // Combine words: vary one word at a time from the best spelling of each.
  const best = perWord.map((w) => w[0] ?? '')
  const results = [best.join(' ')]
  for (let rank = 1; results.length < limit && rank < 12; rank++) {
    for (let w = perWord.length - 1; w >= 0 && results.length < limit; w--) {
      if (!perWord[w][rank]) continue
      const combo = [...best]
      combo[w] = perWord[w][rank]
      const text = combo.join(' ')
      if (!results.includes(text)) results.push(text)
    }
  }
  return results.slice(0, limit)
}
