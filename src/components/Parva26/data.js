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

// Scene 6: ಇಂದೇ ನೋಡಿ · Now Showing
export const EVENTS = [
  {
    id: 'quiz',
    title: 'ಕ್ವಿಜ್ ರಾಜ',
    titleEn: 'Kannada Quiz',
    genre: 'Thriller',
    time: 'Oct 29 · 10:00 AM',
    venue: 'CH-1',
    registerLink: '#',
  },
  {
    id: 'ctf',
    title: 'ಗುಪ್ತ ಕೋಡ್',
    titleEn: 'CTF',
    genre: 'Mystery',
    time: 'Oct 30 · 11:00 AM',
    venue: 'CSE Lab',
    registerLink: '#',
  },
  {
    id: 'build',
    title: 'ನಿರ್ಮಾಣ',
    titleEn: 'Build Challenge',
    genre: 'Action',
    time: 'Oct 30 · 2:00 PM',
    venue: 'Workshop',
    registerLink: '#',
  },
  {
    id: 'music',
    title: 'ಸಂಗೀತ ಸಂಜೆ',
    titleEn: 'Music Night',
    genre: 'Musical',
    time: 'Nov 1 · 7:00 PM',
    venue: 'SJA',
    registerLink: '#',
  },
]

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
