// The scroll sections of the page, in order. `scene` matches the numbering in
// parve26spec.md §3 and `act` drives the film reel's paper tag.
// Scenes 0 and 1 (lamp, curtain) are intro overlays, not sections. `skip`
// puts a Skip button on a long scene while you are in it (chrome/skip-scene):
// `true` goes on to the next scene; an object is the button's own wording,
// for a scene that marks where it lands with data-skip-to.
export const ACTS = {
  'first-half': { kn: 'ಮೊದಲಾರ್ಧ', en: 'First Half' },
  interval: { kn: 'ವಿರಾಮ', en: 'Interval' },
  'second-half': { kn: 'ದ್ವಿತೀಯಾರ್ಧ', en: 'Second Half' },
  end: { kn: 'ಶುಭಂ', en: 'The End' },
}

export const SCENES = [
  { scene: 2, id: 'title', act: 'first-half', kn: 'ಪರ್ವ', en: 'Parva 2026' },
  { scene: 3, id: 'certificate', act: 'first-half', kn: 'ಪ್ರಮಾಣ ಪತ್ರ', en: 'Certificate' },
  { scene: 6, id: 'now-showing', act: 'first-half', kn: 'ಇಂದೇ ನೋಡಿ', en: 'Now Showing' },
  { scene: 4, id: 'gandhada-gudi', act: 'first-half', kn: 'ಗಂಧದ ಗುಡಿ', en: 'Why sandalwood', skip: true },
  { scene: 7, id: 'guests', act: 'first-half', kn: 'ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ', en: 'Special Appearance', skip: true },
  { scene: 8, id: 'interval', act: 'interval', kn: 'ವಿರಾಮ', en: 'Interval' },
  { scene: 9, id: 'release-day', act: 'interval', kn: 'ಬಿಡುಗಡೆ ದಿನ', en: 'Release Day' },
  { scene: 10, id: 'timeline', act: 'second-half', kn: 'ಬೆಳ್ಳಿ ಪರದೆಯ ಪಯಣ', en: 'Sandalwood through the years', skip: true },
  { scene: 11, id: 'emoji-game', act: 'second-half', kn: 'ಯಾವ ಸಿನಿಮಾ?', en: 'Which film?' },
  { scene: 12, id: 'credits', act: 'end', kn: 'ಶುಭಂ', en: 'Credits', skip: { kn: 'ಕ್ರೆಡಿಟ್ಸ್ ಬಿಡಿ', en: 'Skip credits' } },
]

// The programme in the top bar: the parts people come to the page for, so
// they can skip the story in between. Each `id` is a section above. An entry
// with `choices` opens a small card to pick from instead (`href` is where
// each goes); `scenes` lists the sections it covers, for underlining the
// part on screen. `icon` names an entry's (or a choice's) drawing in
// chrome/programme.jsx.
export const PROGRAMME = [
  { id: 'now-showing', icon: 'ticket', kn: 'ಕಾರ್ಯಕ್ರಮಗಳು', en: 'Events' },
  {
    id: 'guests',
    icon: 'frame',
    kn: 'ಅತಿಥಿಗಳು',
    en: 'Guests',
    choices: [
      { href: '#guests', icon: 'veil', kn: 'ಈ ವರ್ಷದ ಅತಿಥಿಗಳು', en: 'This year’s guests', line: { kn: 'ಮುಸುಕು ತೆರೆಯುವ ದಿನಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದ್ದಾರೆ', en: 'Under the veil until their day' } },
      { href: '#past-guests', icon: 'lit', kn: 'ಇದುವರೆಗಿನ ಅತಿಥಿಗಳು', en: 'Guests till now', line: { kn: 'ಹಿಂದಿನ ಪರ್ವಗಳ ಅತಿಥಿಗಳು', en: 'Guests of past Parvas' } },
    ],
  },
  { id: 'interval', icon: 'meal', kn: 'ಊಟ · ಅಂಗಿ', en: 'Food & Merch' },
  {
    id: 'games',
    icon: 'clapper',
    scenes: ['release-day', 'emoji-game'],
    kn: 'ಆಟಗಳು',
    en: 'Games',
    choices: [
      { href: '#release-day', icon: 'flowers', kn: 'ಹೂಮಳೆ', en: 'Flower shower', line: { kn: 'ಸಮುದ್ರಪ್ಪನಿಗೆ ಹೂವು ಎಸೆಯಿರಿ', en: 'Throw flowers at Samudrappa' } },
      { href: '#emoji-game', icon: 'film', kn: 'ಯಾವ ಸಿನಿಮಾ?', en: 'Which film?', line: { kn: 'ಎಮೋಜಿ ನೋಡಿ ಸಿನಿಮಾ ಹೆಸರಿಸಿ', en: 'Name the film from its emoji' } },
    ],
  },
]
