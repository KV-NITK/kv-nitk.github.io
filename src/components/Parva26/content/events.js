import gahanaPoster from '@p26/assets/posters/gahana-band.webp'
import dilipPoster from '@p26/assets/posters/dilip-shankar.webp'

// One Google Form registers for all three literary events (30 Oct)
const LITERARY_FORM = 'https://forms.gle/5zEjfXj5fFVKBoRp8'

// Scene 6: ಇಂದೇ ನೋಡಿ · Now Showing.
// TODO(content): stand-ins taken from Parva 2025's events and moved onto this
// year's days; replace with the real list (titles, day, time, venue, one
// line, register link). `type` picks the poster's picture and genre stamp;
// `headline` puts the poster on the board (the rest are under "All shows");
// `photo` swaps the drawn picture for a real image (singers and guests only);
// `lineKn`, where there is one, is the line in Kannada, shown while the
// subtitles are off (`line` is the English subtitle).
export const EVENTS = [
  { id: 'gahana', type: 'music', headline: true, kn: 'ಗಹನ ಬ್ಯಾಂಡ್', en: 'Gahana Band', day: '2026-11-01', time: '8:00 PM', venue: 'SAC', line: 'A live music concert to close Parva.', registerLink: '#', photo: gahanaPoster },
  // TODO(content): one poster says 9:00 PM, the other 4:30 PM
  { id: 'comedy', type: 'comedy', headline: true, kn: 'ದಿಲೀಪ್ ಶಂಕರ್', en: 'Dilip Shankar', day: '2026-10-31', time: '9:00 PM', venue: 'SJA', line: 'An evening of stand-up comedy.', registerLink: '#', photo: dilipPoster },
  { id: 'jnaana-yaana', type: 'quiz', headline: true, kn: 'ಜ್ಞಾನ ಯಾನ', en: 'Jnaana Yaana', day: '2026-10-30', time: '7–9 PM', venue: 'LHC A Seminar Hall', lineKn: 'ಸಾಮಾನ್ಯ ಜ್ಞಾನ, ಕನ್ನಡ ಭಾಷೆ, ಸಾಹಿತ್ಯ, ಸಂಸ್ಕೃತಿಯ ತಂಡ ರಸಪ್ರಶ್ನೆ. ತಂಡಕ್ಕೆ 3–4 ಜನ.', line: 'A team quiz on general knowledge, Kannada, literature and culture. Teams of 3–4.', registerLink: LITERARY_FORM, photo: null },
  { id: 'nudi-chatura', type: 'literature', headline: true, kn: 'ನುಡಿ ಚತುರ', en: 'Nudi Chatura', day: '2026-10-30', time: '6–7 PM', venue: 'LHC A Seminar Hall', lineKn: 'ಅರ್ಧ ಕೊಟ್ಟ ಗಾದೆ ಮಾತು, ಒಗಟುಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ. ತಂಡಕ್ಕೆ 2 ಜನ.', line: 'Write the missing half of Kannada proverbs and riddles. Teams of 2.', registerLink: LITERARY_FORM, photo: null },
  // { id: 'natak', type: 'drama', headline: true, kn: 'ಪ್ರಾಧ್ಯಾಪಕರ ನಾಟಕ', en: 'Professors’ play', day: '2026-11-01', time: '3:00 PM', venue: 'SJA', line: 'Our professors take the stage.', registerLink: '#', photo: null },
  { id: 'charades', type: 'comedy', headline: true, kn: 'ಮೂಕಾಭಿನಯ', en: 'Dumb Charades', day: '2026-10-30', time: '2:00 PM', venue: 'MB Seminar Hall', line: 'Act out film titles without a word. Teams of three.', registerLink: '#', photo: null },
  { id: 'film', type: 'film', headline: false, kn: 'ಚಿತ್ರ ಪ್ರದರ್ಶನ', en: 'Film screening', day: '2026-10-29', time: '6:00 PM', venue: 'SJA', line: 'A Kannada film on the big screen to open Parva.', registerLink: '#', photo: null },
  { id: 'flashmob', type: 'dance', headline: false, kn: 'ಫ್ಲ್ಯಾಶ್ ಮಾಬ್', en: 'Flashmob', day: '2026-10-29', time: '5:00 PM', venue: 'BB Court', line: 'A surprise dance in the middle of campus. Join in.', registerLink: '#', photo: null },
  { id: 'antyakshari', type: 'music', headline: true, kn: 'ಅಂತ್ಯಾಕ್ಷರಿ', en: 'Antyakshari', day: '2026-10-30', time: '9–11 PM', venue: 'LHC A Seminar Hall', lineKn: 'ಚಿತ್ರ, ಮೂಕ ಧ್ವನಿ ತುಣುಕು ನೋಡಿ ಕನ್ನಡ ಹಾಡು ಗುರುತಿಸಿ. ತಂಡಕ್ಕೆ 4 ಜನ; ಕನ್ನಡೇತರರಿದ್ದರೆ +1 ಅಂಕ.', line: 'Guess Kannada songs from pictures and muted clips. Teams of 4; +1 for a non-Kannadiga.', registerLink: LITERARY_FORM, photo: null },
  { id: 'sobagu', type: 'culture', headline: false, kn: 'ಸೊಬಗು', en: 'Sobagu', day: '2026-10-30', time: '5:00 PM', venue: 'Pavilion', line: 'An evening of Karnataka’s traditions.', registerLink: '#', photo: null },
]

// Genre stamps by kind of event, as on old film posters (allscenes.md, Scene
// 6; the ones past music are additions). TODO(content): proofread.
export const GENRES = {
  quiz: { kn: 'ರೋಮಾಂಚಕ', en: 'Thriller' },
  ctf: { kn: 'ನಿಗೂಢ', en: 'Mystery' },
  build: { kn: 'ಸಾಹಸ', en: 'Action' },
  music: { kn: 'ಸಂಗೀತಮಯ', en: 'Musical' },
  dj: { kn: 'ಸಾಹಸ', en: 'Action' },
  dance: { kn: 'ಸಾಹಸ', en: 'Action' },
  literature: { kn: 'ಪ್ರೇಮ', en: 'Romance' },
  comedy: { kn: 'ಹಾಸ್ಯ', en: 'Comedy' },
  drama: { kn: 'ನಾಟಕ', en: 'Drama' },
  film: { kn: 'ಕ್ಲಾಸಿಕ್', en: 'Classic' },
  culture: { kn: 'ಕುಟುಂಬ', en: 'Family' },
}

const MONTHS = { 9: ['ಸೆಪ್ಟೆಂಬರ್', 'Sep'], 10: ['ಅಕ್ಟೋಬರ್', 'Oct'], 11: ['ನವೆಂಬರ್', 'Nov'], 12: ['ಡಿಸೆಂಬರ್', 'Dec'] }

// "ಅಕ್ಟೋಬರ್ 30" and "30 Oct" for an ISO day, with normal digits (A5).
export function eventDay(iso) {
  const [, month, day] = iso.split('-').map(Number)
  const [kn, en] = MONTHS[month] ?? ['', '']
  return { kn: `${kn} ${day}`, en: `${day} ${en}` }
}
