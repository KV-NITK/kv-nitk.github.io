// Parva Market (ಪರ್ವ ಸಂತೆ): the walkable forecourt the interval's doors open
// onto, with the merch and food stalls. The stalls sell what TEE and MEAL
// (interval.js) describe.
// TODO(content): proofread every Kannada line here.
export const MARKET = {
  title: { kn: 'ಪರ್ವ ಸಂತೆ', en: 'Parva Market' },
  intro: { kn: 'ಅಂಗಡಿಗೆ ನಡೆದು ಹೋಗಿ, ಅಥವಾ ಕೆಳಗಿನ ಗುಂಡಿ ಒತ್ತಿ', en: 'Walk to a stall, or use the buttons below' },
  choose: { kn: 'ಯಾರು ನಡೆಯಬೇಕು ಆರಿಸಿ', en: 'Pick who walks' },
  chooseNext: { kn: 'ನಂತರ ಅಂಗಡಿಗೆ ನಡೆಯಿರಿ', en: 'Then walk to a stall to shop' },
  change: { kn: 'ಪಾತ್ರ ಬದಲಿಸಿ', en: 'Change role' },
  play: { kn: 'ಆಡಲು ಒತ್ತಿ', en: 'Click to play' },
  playFirst: { kn: 'ಮೊದಲು ಆಟದ ಮೇಲೆ ಒತ್ತಿ', en: 'Click the game first' },
  playing: { kn: 'ಹೊರಬರಲು Esc', en: 'Playing · Esc to leave' },
  walk: { kn: 'ನಡೆಯಿರಿ', en: 'Walk' },
  enter: { kn: 'ಒಳಗೆ ಹೋಗಿ', en: 'Enter' },
  tapWalk: { kn: 'ನಡೆಯಲು ಮುಟ್ಟಿ', en: 'Tap to walk' },
  tapShop: { kn: 'ಒಳಗೆ ಹೋಗಲು ಅಂಗಡಿ ಮುಟ್ಟಿ', en: 'Tap a stall to enter' },
  help: { kn: 'ಹೇಗೆ ಆಡುವುದು', en: 'How to play' },
  pressE: { kn: 'E ಒತ್ತಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ', en: 'Press E or click' },
  soon: { kn: 'ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ', en: 'Coming soon' },
  loading: { kn: 'ಸಂತೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ…', en: 'Setting up the market…' },
  failed: { kn: 'ಈ ಸಾಧನದಲ್ಲಿ ಸಂತೆ ತೆರೆಯಲಿಲ್ಲ', en: 'The market could not open on this device' },
}

// Where you can go from the forecourt. `go` is a route and `scroll` the id of
// a scene further down the page; a stall with neither says it is coming
// soon. `kind` picks how a stall is drawn and `sign` is what its board says.
export const PLACES = [
  { id: 'theatre', scroll: 'release-day', kn: 'ಪ್ರದರ್ಶನ ಮುಂದುವರಿಸಿ', en: 'Back to the show' },
  { id: 'food', kind: 'food', go: '/parva-26/coupon', kn: 'ಭೂರಿ ಭೋಜನ', en: 'Bhoori Bhojana · food coupon', sign: { kn: 'ಭೂರಿ ಭೋಜನ', en: 'Food coupon' } },
  { id: 'merch', kind: 'merch', go: '/parva-26/merch', kn: 'ಪರ್ವ ಅಂಗಡಿ', en: 'Parva Angadi · merch', sign: { kn: 'ಪರ್ವ ಅಂಗಡಿ', en: 'Merch' } },
]
