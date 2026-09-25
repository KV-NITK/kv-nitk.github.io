import { teamMembers } from '@/data/teamData'

// Scene 12: the end credits. The names are the main site's team list
// (src/data/teamData.js, the team section on the home page), each team role
// credited as the film job it's closest to.
// TODO(content): confirm the film-job names with the team, and add each
// person's Kannada spelling (confirmed by them) as `kn` beside their name.
const FILM_JOBS = [
  { team: 'Convenor', kn: 'ನಿರ್ದೇಶನ', en: 'Directed by' },
  { team: 'Co-Convenor', kn: 'ಸಹ ನಿರ್ದೇಶನ', en: 'Co-directed by' },
  { team: 'Chief Executive', kn: 'ನಿರ್ಮಾಣ', en: 'Produced by' },
  { team: 'Management Head', kn: 'ನಿರ್ಮಾಣ ನಿರ್ವಹಣೆ', en: 'Production management' },
  { team: 'Operations Head', kn: 'ಚಿತ್ರೀಕರಣ ನಿರ್ವಹಣೆ', en: 'Line producers' },
  { team: 'Marketing Head', kn: 'ವಿತರಣೆ', en: 'Distribution' },
  { team: 'Media Head', kn: 'ಛಾಯಾಗ್ರಹಣ', en: 'Cinematography' },
  { team: 'Technical Head', kn: 'ವಿಶೇಷ ಪರಿಣಾಮಗಳು', en: 'Special effects' },
  { team: 'Creative & Cultural Head', kn: 'ಕಲಾ ನಿರ್ದೇಶನ', en: 'Art direction' },
  { team: 'Publicity Head', kn: 'ಪ್ರಚಾರ', en: 'Publicity' },
  { team: 'Literary Head', kn: 'ಸಂಭಾಷಣೆ ಮತ್ತು ಸಾಹಿತ್ಯ', en: 'Dialogue and lyrics' },
  { team: 'PG Coordinator', kn: 'ಸಹಾಯಕ ನಿರ್ದೇಶಕರು', en: 'Assistant directors' },
]

// Core team members whose entries are commented out in teamData.js until
// their photos arrive; the credits need only their names.
const TEAM_WITHOUT_PHOTOS = [
  { name: 'Puneeth', role: 'Chief Executive' },
  { name: 'Mohan Kumar M.E.', role: 'Management Head' },
  { name: 'Naveen S. Avari', role: 'Operations Head' },
  { name: 'Harsha K.', role: 'Operations Head' },
  { name: 'Nandeesh Nayak M.', role: 'Publicity Head' },
  { name: 'Yogeesh', role: 'Publicity Head' },
  { name: 'Sumukh', role: 'PG Coordinator' },
  { name: 'Abhiram', role: 'PG Coordinator' },
]

const everyone = [...teamMembers, ...TEAM_WITHOUT_PHOTOS.filter((p) => !teamMembers.some((m) => m.name === p.name))]

export const CREDITS = [
  { kn: 'ಮಾರ್ಗದರ್ಶನ', en: 'Guidance', team: 'Faculty Advisor', people: ['Dr. Kiran M'] },
  ...FILM_JOBS.map((job) => ({ ...job, people: everyone.filter((m) => m.role === job.team).map((m) => m.name) })).filter((job) => job.people.length),
  { kn: 'ಸ್ವಯಂಸೇವಕರು', en: 'Crew', team: 'Volunteers', people: ['Every volunteer of Kannada Vedike'] },
]

// The small print at the very end of the credits.
export const ASSET_CREDITS = [
  { what: 'Fonts', who: 'Anek Kannada, Baloo Tamma 2, Noto Serif Kannada, Akaya Kanadaka, Bebas Neue, Special Elite', licence: 'SIL Open Font License' },
  { what: 'Emoji', who: 'Twemoji, by X Corp. and contributors', licence: 'CC BY 4.0' },
  { what: 'Photos', who: 'Kannada Vedike, NITK: Parva 2025 and the club gallery', licence: null },
  { what: 'Illustrations', who: 'Drawn in code for Parva 2026', licence: null },
]

export const CONTACT = {
  people: [
    { name: 'Dr. Kiran M', role: 'Faculty Advisor', email: 'kiranmanjappa@nitk.edu.in' },
    { name: 'Yashas Gowda', role: 'Convenor', email: 'yashasgowdam0@gmail.com' },
  ],
  social: [
    { name: 'Instagram', href: 'https://www.instagram.com/kannadavedike_nitk/' },
    { name: 'Facebook', href: 'https://m.facebook.com/kannadavedikenitk/' },
    { name: 'X (Twitter)', href: 'https://twitter.com/kv_nitk' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/kannada-vedike-nitk-997574251/' },
  ],
  // TODO(content): the policy pages the payment gateway needs; each link
  // shows once it has an address.
  policies: [
    { name: 'Terms', href: null },
    { name: 'Privacy', href: null },
    { name: 'Refunds', href: null },
  ],
  // TODO(content): a gallery page of its own; until then, Parva 2025's.
  gallery: '/parva',
}
