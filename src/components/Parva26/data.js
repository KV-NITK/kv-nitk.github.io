import baligarPhoto from './assets/guests/shambhu-baligar.webp'
import bhavvanaPhoto from './assets/guests/bhavvana-rao.webp'
import vinayakPhoto from './assets/guests/vinayak-kulkarni.webp'

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

const MONTHS = { 9: ['ಸೆಪ್ಟೆಂಬರ್', 'Sep'], 10: ['ಅಕ್ಟೋಬರ್', 'Oct'], 11: ['ನವೆಂಬರ್', 'Nov'], 12: ['ಡಿಸೆಂಬರ್', 'Dec'] }

// "ಅಕ್ಟೋಬರ್ 30" and "30 Oct" for an ISO day, with normal digits (A5).
export function eventDay(iso) {
  const [, month, day] = iso.split('-').map(Number)
  const [kn, en] = MONTHS[month] ?? ['', '']
  return { kn: `${kn} ${day}`, en: `${day} ${en}` }
}

// Scene 7: ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ · Special Appearance, the lobby's wall of honour.
// This year's guests stay under a veil until their reveal date. The server
// will send a guest's name, photo and session only after that date (spec §3
// Scene 7); before it, only the date, the role if it's no secret, and the
// PR team's teaser. So nothing here names anyone.
// TODO(backend): fetch these (step 16). TODO(content): real dates, roles and
// teasers; Kannada to be proofread. `place` is the frame's spot on the wall,
// left to right, with the Chief Guest in the middle.
export const GUESTS = [
  { id: 'g1', place: 0, revealDate: '2026-10-01', role: null, teaser: { kn: '200 ಹಾಡುಗಳಲ್ಲಿ ನೀವು ಕೇಳಿದ ಧ್ವನಿ', en: 'A voice you’ve heard in 200 songs' } },
  { id: 'g2', place: 1, revealDate: '2026-10-08', role: null, teaser: { kn: 'ಇವರ ಕತೆಗಳು ಪಠ್ಯಪುಸ್ತಕದಲ್ಲಿವೆ', en: 'You read their stories in school' } },
  { id: 'chief', place: 2, chief: true, revealDate: '2026-10-22', role: { kn: 'ಮುಖ್ಯ ಅತಿಥಿ', en: 'Chief Guest' }, teaser: { kn: 'ಗಂಧದ ಗುಡಿಯಿಂದಲೇ ಬರುವವರು', en: 'Straight from Sandalwood' } },
  { id: 'g3', place: 3, revealDate: '2026-10-15', role: null, teaser: null },
  { id: 'g4', place: 4, revealDate: '2026-10-25', role: { kn: 'ಗೌರವ ಅತಿಥಿ', en: 'Guest of Honour' }, teaser: { kn: 'ಒಂದು ಸುಳಿವು: ರಂಗಭೂಮಿ', en: 'One clue: the stage' } },
]

// Guests of past Parvas, framed on the same wall with their lamps lit. The
// photos are cropped from the Parva 2025 guest posters.
// TODO(content): confirm the Kannada spellings with each guest.
export const PAST_GUESTS = [
  { id: 'baligar', year: 2025, photo: baligarPhoto, name: { kn: 'ಡಾ. ಶಂಭು ಬಳಿಗಾರ', en: 'Dr. Shambhu Baligar' }, role: { kn: 'ಮುಖ್ಯ ಅತಿಥಿ', en: 'Chief Guest' }, when: { kn: 'ನವೆಂಬರ್ 1, 2025 · SJA', en: '1 Nov 2025, SJA' }, line: 'Opened Parva 2025.' },
  { id: 'bhavvana', year: 2025, photo: bhavvanaPhoto, name: { kn: 'ಭಾವನಾ ರಾವ್', en: 'Bhavvana Rao' }, role: { kn: 'ಗೌರವ ಅತಿಥಿ', en: 'Guest of Honour' }, when: { kn: 'ನವೆಂಬರ್ 2, 2025 · SJA', en: '2 Nov 2025, SJA' }, line: 'Guest of honour on the second day.' },
  { id: 'vinayak', year: 2025, photo: vinayakPhoto, name: { kn: 'ವಿನಾಯಕ ಕುಲಕರ್ಣಿ', en: 'Vinayak Kulkarni' }, role: { kn: 'ಹಾಸ್ಯ ಕಲಾವಿದ', en: 'Stand-up comic' }, when: { kn: 'ನವೆಂಬರ್ 2, 2025 · ರಾತ್ರಿ 9', en: '2 Nov 2025, 9 PM' }, line: 'Stand-up comedy at SJA.' },
]

// Sponsors, credited the way a film credits its backers. Each tier gets its
// own brass plate on the producers' board in Scene 7.
// TODO(content): this year's sponsors and tiers; these are Parva 2025's
// logos as stand-ins. `href` makes a plate a link to the sponsor.
export const SPONSOR_TIERS = [
  { id: 'executive', kn: 'ಕಾರ್ಯಕಾರಿ ನಿರ್ಮಾಪಕರು', en: 'Executive Producers' },
  { id: 'associate', kn: 'ಸಹಯೋಗದೊಂದಿಗೆ', en: 'In association with' },
  { id: 'media', kn: 'ಮಾಧ್ಯಮ ಸಹಯೋಗ', en: 'Media partner' },
]

export const SPONSORS = [
  { id: 'nandini', tier: 'executive', name: 'Nandini', logo: '/sponsors/s3.png', href: null },
  { id: 'insights', tier: 'executive', name: 'InsightsIAS', logo: '/sponsors/s1.jpg', href: null },
  { id: 'ruby', tier: 'executive', name: 'Ruby Travels', logo: '/sponsors/s2.jpeg', href: null },
  { id: 'heaven', tier: 'executive', name: '7th Heaven', logo: '/sponsors/s4.png', href: null },
  { id: 'alumni', tier: 'associate', name: 'NITK Surathkal Alumni', logo: '/sponsors/s5.jpeg', href: null },
  { id: 'batch23', tier: 'associate', name: 'Batch of 2023', logo: '/sponsors/s6.png', href: null },
  { id: 'daijiworld', tier: 'media', name: 'Daijiworld TV', logo: '/sponsors/s7.png', href: null },
]

// Scene 8: ವಿರಾಮ · Interval. Two things are sold: the Bhoori Bhojana meal
// coupon and the Parva tee.
// TODO(content): stand-ins from Parva 2025's food coupon (OSC, 12:00 PM,
// ₹199) moved to this year's last day; confirm the day, time, place, price,
// number of coupons and the menu with its serving order (from the caterer).
// TODO(backend): `sold` comes from the server; `bookLink` goes to payment.
export const MEAL = {
  day: '2026-11-01',
  time: { kn: 'ಮಧ್ಯಾಹ್ನ 12:00', en: '12:00 PM' },
  venue: { kn: 'ಹಳೆ ಕ್ರೀಡಾ ಸಂಕೀರ್ಣ', en: 'Old Sports Complex (OSC)' },
  price: 199,
  coupons: 300,
  sold: 162,
  bookLink: '#',
}

// Served onto the leaf in this order. `dish` picks the drawing.
export const MENU = [
  { id: 'chapati', dish: 'chapati', kn: 'ಚಪಾತಿ', en: 'Chapati' },
  { id: 'sukka', dish: 'sukka', kn: 'ಸುಕ್ಕ', en: 'Sukka, a dry coconut masala' },
  { id: 'kabab', dish: 'kabab', kn: 'ಕಬಾಬ್', en: 'Kabab' },
  { id: 'gassi', dish: 'bowl', kn: 'ಗಸಿ', en: 'Gassi, a coconut curry' },
  { id: 'ghee-rice', dish: 'gheeRice', kn: 'ತುಪ್ಪದ ಅನ್ನ', en: 'Ghee rice' },
  { id: 'rice', dish: 'rice', kn: 'ಅನ್ನ', en: 'Rice' },
  { id: 'vada', dish: 'vada', kn: 'ವಡೆ', en: 'Vada' },
  { id: 'sweet', dish: 'sweet', kn: 'ಸಿಹಿ', en: 'A sweet' },
  { id: 'curd', dish: 'curd', kn: 'ಮೊಸರು', en: 'Curd' },
]

// The tee, in two variants. `photos` swaps the drawn tee for real photos.
// TODO(content): real designs, prices, the early-price quota, sizes in stock
// and the order deadline. TODO(backend): stock and `earlySold` from the
// server; `buyLink` goes to payment.
export const TEE = {
  name: { kn: 'ಪರ್ವ ಟೀ ಶರ್ಟ್', en: 'Parva T-shirt' },
  price: 399,
  earlyPrice: 349,
  earlyQuota: 50,
  earlySold: 32,
  closes: '2026-10-20',
  buyLink: '#',
  variants: [
    { id: 'black', kn: 'ಕಪ್ಪು', en: 'Black', body: '#1f1b18', print: '#f2c12e', ink: '#c8102e', photos: null, soldOut: ['XXL'] },
    { id: 'sandal', kn: 'ಗಂಧದ ಬಣ್ಣ', en: 'Sandal', body: '#ead6b0', print: '#8e0b20', ink: '#6b3f22', photos: null, soldOut: [] },
  ],
  sizes: [
    { id: 'S', chest: 38, length: 27 },
    { id: 'M', chest: 40, length: 28 },
    { id: 'L', chest: 42, length: 29 },
    { id: 'XL', chest: 44, length: 30 },
    { id: 'XXL', chest: 46, length: 31 },
  ],
}

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
