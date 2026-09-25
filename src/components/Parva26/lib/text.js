const KANNADA_DIGITS = '೦೧೨೩೪೫೬೭೮೯'

export function toKannadaDigits(value) {
  return String(value).replace(/[0-9]/g, (d) => KANNADA_DIGITS[d])
}

const segmenter = Intl.Segmenter ? new Intl.Segmenter('kn', { granularity: 'grapheme' }) : null
const VIRAMA = '್'

// Splits text into aksharas (visible syllables), so Kannada can be typed or
// laid out one piece at a time without detaching a vowel sign from its
// consonant. Grapheme segmentation splits conjuncts like ನ್ನ after the
// virama, so those pieces are joined back up.
export function graphemes(text) {
  const parts = segmenter ? Array.from(segmenter.segment(text), (s) => s.segment) : Array.from(text)
  return parts.reduce((out, part) => {
    if (out.length && out[out.length - 1].endsWith(VIRAMA)) out[out.length - 1] += part
    else out.push(part)
    return out
  }, [])
}
