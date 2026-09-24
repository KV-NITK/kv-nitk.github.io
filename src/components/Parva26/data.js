// Placeholder content for the Parva 2026 page. Replace with real details
// before launch — see parve26spec.md §5 "Content to write or collect".
// TODO(content): confirm date, venue and every item below with the team.

export const EVENT = {
  // Opening day; the countdown runs to this. TODO(content): confirm the start time
  date: '2026-10-29T10:00:00+05:30',
  // Three days: 29 and 30 October, then 1 November. Dates always use normal
  // digits, even in Kannada (allscenes.md A5).
  dateKn: 'ಅಕ್ಟೋಬರ್ 29, 30 ಮತ್ತು ನವೆಂಬರ್ 1',
  dateEn: '29 & 30 Oct and 1 Nov 2026',
  // Events run all over the campus; each event gives its own venue.
  venue: 'NITK Surathkal',
}

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

const MONTHS = { 10: ['ಅಕ್ಟೋಬರ್', 'Oct'], 11: ['ನವೆಂಬರ್', 'Nov'] }

// "ಅಕ್ಟೋಬರ್ 30" and "30 Oct" for an ISO day, with normal digits (A5).
export function eventDay(iso) {
  const [, month, day] = iso.split('-').map(Number)
  const [kn, en] = MONTHS[month] ?? ['', '']
  return { kn: `${kn} ${day}`, en: `${day} ${en}` }
}

// Scene 7: ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ · Special Appearance
// TODO(content): real guests + reveal dates; move this behind the guest-reveal
// backend (step 16) so names aren't visible in the page source before then.
export const GUESTS = [
  { id: 'g1', revealDate: '2026-10-15', name: null, role: null, line: null },
  { id: 'g2', revealDate: '2026-11-01', name: null, role: null, line: null },
  { id: 'g3', revealDate: '2026-11-10', name: null, role: null, line: null },
]

// Scene 8: ಭೂರಿ ಭೋಜನ · Bhoori Bhojana slots
export const MEAL_SLOTS = [
  { id: 'lunch-1', label: 'Lunch show · 12:00', capacity: 100, booked: 62 },
  { id: 'lunch-2', label: 'Lunch show · 12:45', capacity: 100, booked: 100 },
  { id: 'lunch-3', label: 'Lunch show · 1:30', capacity: 100, booked: 18 },
]

export const MENU_ITEMS = [
  'ಅನ್ನ · Rice', 'ಸಾಂಬಾರ್ · Sambar', 'ಪಾಯಸ · Payasa', 'ಪಲ್ಯ · Palya', 'ಪಪ್ಪಡ · Papad',
] // TODO(content): confirm real menu

export const MERCH_ITEMS = [
  { id: 'tee', name: 'ಪರ್ವ Tee', price: '₹399', fdfsPrice: '₹349', soldOut: false },
  { id: 'tote', name: 'Tote Bag', price: '₹199', fdfsPrice: '₹179', soldOut: false },
  { id: 'sticker', name: 'Sticker Pack', price: '₹99', fdfsPrice: null, soldOut: true },
] // TODO(content): confirm items, sizes, pickup details

export const TIMELINE = [
  { year: 1934, film: 'Sati Sulochana', line: 'The first Kannada talkie' },
  { year: 1954, film: 'Bedara Kannappa', line: "Dr. Rajkumar's first film as hero" },
  { year: 1964, film: 'Amarashilpi Jakanachari', line: 'Often called the first Kannada film in colour' },
  { year: 1970, film: 'Samskara', line: 'National Award for Best Feature Film; start of the parallel cinema wave' },
  { year: 1972, film: 'Naagarahaavu', line: "Vishnuvardhan's first lead role" },
  { year: 1973, film: 'Gandhada Gudi', line: 'The same year the state was renamed Karnataka' },
  { year: 1995, film: 'Om', line: "Upendra's cult film, famous for being re-released again and again" },
  { year: 2002, film: 'Appu', line: "Puneeth Rajkumar's first film as lead" },
  { year: 2006, film: 'Mungaru Male', line: 'The rain-soaked romance that broke box-office records' },
  { year: 2013, film: 'Lucia', line: 'Crowdfunded by its own audience' },
  { year: 2018, film: 'K.G.F: Chapter 1', line: 'Took Kannada cinema across India' },
  { year: 2022, film: 'Kantara', line: 'Rishab Shetty later won the National Award for Best Actor' },
  { year: 2026, film: 'ಪರ್ವ', line: '"You are here"' },
] // TODO(content): verify every date before publishing

export const CREDITS = [
  { role: 'ನಿರ್ದೇಶನ · Directed by', people: ['Convener'] },
  { role: 'ನಿರ್ಮಾಣ · Produced by', people: ['Finance team'] },
  { role: 'ಸಂಗೀತ · Music', people: ['Cultural team'] },
  { role: 'ಕಲಾ ನಿರ್ದೇಶನ · Art direction', people: ['Design team'] },
  { role: 'ವಿಶೇಷ ಪರಿಣಾಮಗಳು · Special effects', people: ['Web & tech team'] },
  { role: 'ಪ್ರಚಾರ · Publicity', people: ['PR team'] },
  { role: 'ಸ್ವಯಂಸೇವಕರು · Crew', people: ['Volunteers'] },
] // TODO(content): real names, Kannada spelling confirmed by each person
