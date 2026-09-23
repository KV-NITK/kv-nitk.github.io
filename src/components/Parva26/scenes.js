// The scroll sections of the page, in order. `scene` matches the numbering in
// parve26spec.md §3 and `act` drives the reel progress labels (spec §2).
// Scenes 0 and 1 (lamp, curtain) are intro overlays, not sections.
export const ACTS = {
  'first-half': 'First Half',
  interval: 'ವಿರಾಮ',
  'second-half': 'Second Half',
  climax: 'Climax',
}

export const SCENES = [
  { scene: 2, id: 'title', act: 'first-half', kn: 'ಪರ್ವ', en: 'Parva 2026' },
  { scene: 3, id: 'certificate', act: 'first-half', kn: 'ಪ್ರಮಾಣ ಪತ್ರ', en: 'Certificate' },
  { scene: 4, id: 'gandhada-gudi', act: 'first-half', kn: 'ಗಂಧದ ಗುಡಿ', en: 'Why sandalwood' },
  { scene: 5, id: 'fan-pass', act: 'first-half', kn: 'ಅಭಿಮಾನಿ ಪಾಸ್', en: 'Fan Pass' },
  { scene: 6, id: 'now-showing', act: 'first-half', kn: 'ಇಂದೇ ನೋಡಿ', en: 'Now Showing' },
  { scene: 7, id: 'guests', act: 'first-half', kn: 'ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ', en: 'Special Appearance' },
  { scene: 8, id: 'interval', act: 'interval', kn: 'ವಿರಾಮ', en: 'Interval' },
  { scene: 9, id: 'release-day', act: 'second-half', kn: 'ಬಿಡುಗಡೆ ದಿನ', en: 'Release Day' },
  { scene: 10, id: 'timeline', act: 'second-half', kn: 'ಬೆಳ್ಳಿ ಪರದೆಯ ಪಯಣ', en: 'Sandalwood through the years' },
  { scene: 11, id: 'emoji-game', act: 'second-half', kn: 'ಯಾವ ಸಿನಿಮಾ?', en: 'Which film?' },
  { scene: 12, id: 'credits', act: 'climax', kn: 'ಶುಭಂ', en: 'Credits' },
]
