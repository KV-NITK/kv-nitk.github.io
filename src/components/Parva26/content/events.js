// Scene 6: ಇಂದೇ ನೋಡಿ · Now Showing.
// TODO(content): stand-ins taken from Parva 2025's events and moved onto this
// year's days; replace with the real list (titles, day, time, venue, one
// line, register link). `type` picks the poster's picture and genre stamp;
// `headline` puts the poster on the board (the rest are under "All shows");
// `photo` swaps the drawn picture for a real image (singers and guests only).
export const EVENTS = [
  { id: 'rasasanje', type: 'music', headline: true, kn: 'ಸಂಗೀತ ರಸಸಂಜೆ', en: 'Sangeetha Rasasanje', day: '2026-11-01', time: '6:00 PM', venue: 'SAC', line: 'An evening of Kannada songs, sung live.', registerLink: '#', photo: null },
  { id: 'dj', type: 'dj', headline: true, kn: 'ಡಿಜೆ ರಾತ್ರಿ', en: 'DJ Night', day: '2026-11-01', time: '8:30 PM', venue: 'SAC', line: 'Kannada hits, remixed, to close Parva.', registerLink: '#', photo: null },
  { id: 'quiz', type: 'quiz', headline: true, kn: 'ಕ್ವಿಜ್', en: 'Quiz', day: '2026-10-30', time: '6:00 PM', venue: 'MB Seminar Hall', line: 'Karnataka’s films, food, places and people, in six rounds.', registerLink: '#', photo: null },
  { id: 'kavigoshti', type: 'literature', headline: true, kn: 'ಕವಿಗೋಷ್ಠಿ', en: 'Poets’ meet', day: '2026-10-30', time: '11:00 AM', venue: 'SJA', line: 'Read your Kannada poem aloud, or come and listen.', registerLink: '#', photo: null },
  { id: 'natak', type: 'drama', headline: true, kn: 'ಪ್ರಾಧ್ಯಾಪಕರ ನಾಟಕ', en: 'Professors’ play', day: '2026-11-01', time: '3:00 PM', venue: 'SJA', line: 'Our professors take the stage.', registerLink: '#', photo: null },
  { id: 'charades', type: 'comedy', headline: true, kn: 'ಮೂಕಾಭಿನಯ', en: 'Dumb Charades', day: '2026-10-30', time: '2:00 PM', venue: 'MB Seminar Hall', line: 'Act out film titles without a word. Teams of three.', registerLink: '#', photo: null },
  { id: 'film', type: 'film', headline: false, kn: 'ಚಿತ್ರ ಪ್ರದರ್ಶನ', en: 'Film screening', day: '2026-10-29', time: '6:00 PM', venue: 'SJA', line: 'A Kannada film on the big screen to open Parva.', registerLink: '#', photo: null },
  { id: 'flashmob', type: 'dance', headline: false, kn: 'ಫ್ಲ್ಯಾಶ್ ಮಾಬ್', en: 'Flashmob', day: '2026-10-29', time: '5:00 PM', venue: 'BB Court', line: 'A surprise dance in the middle of campus. Join in.', registerLink: '#', photo: null },
  { id: 'antakshari', type: 'music', headline: false, kn: 'ಅಂತ್ಯಾಕ್ಷರಿ', en: 'Antakshari', day: '2026-10-30', time: '4:00 PM', venue: 'MB Seminar Hall', line: 'Sing the next song from the last letter. Kannada songs only.', registerLink: '#', photo: null },
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
