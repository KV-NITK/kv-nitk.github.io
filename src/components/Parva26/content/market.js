// The Parva Market page (/parva-26/market): a walkable forecourt outside the
// theatre with three shops. The shops sell what MEAL and TEE (interval.js)
// describe, plus the photo studio.
// TODO(content): proofread every Kannada line here; the photo studio's name
// and what it sells are not decided yet.
export const MARKET = {
  title: { kn: 'ಪರ್ವ ಸಂತೆ', en: 'Parva Market' },
  choose: { kn: 'ನಿಮ್ಮ ಪಾತ್ರ ಆರಿಸಿ', en: 'Choose your role' },
  change: { kn: 'ಪಾತ್ರ ಬದಲಿಸಿ', en: 'Change role' },
  hint: {
    kn: 'ನಡೆಯಲು ಬಾಣದ ಕೀಲಿಗಳು ಅಥವಾ WASD, ಅಥವಾ ಹೋಗಬೇಕಾದಲ್ಲಿ ಮುಟ್ಟಿ',
    en: 'Walk with the arrow keys or WASD, or tap where you want to go',
  },
  hintTouch: { kn: 'ಹೋಗಬೇಕಾದಲ್ಲಿ ಮುಟ್ಟಿ', en: 'Tap where you want to go' },
  soon: { kn: 'ಶೀಘ್ರದಲ್ಲೇ ತೆರೆಯುತ್ತದೆ', en: 'Opening soon' },
  loading: { kn: 'ಸಂತೆ ಸಿದ್ಧವಾಗುತ್ತಿದೆ…', en: 'Setting up the market…' },
  failed: { kn: 'ಸಂತೆ ತೆರೆಯಲಿಲ್ಲ', en: 'The market could not open on this device' },
}

// Where you can go from the forecourt. `go` is a route; the shops have none
// yet. `kind` picks how a shop is drawn.
export const PLACES = [
  { id: 'theatre', kn: 'ಚಿತ್ರಮಂದಿರಕ್ಕೆ ಹಿಂತಿರುಗಿ', en: 'Back to the theatre', go: '/parva-26' },
  { id: 'food', kind: 'food', kn: 'ಭೂರಿ ಭೋಜನ', en: 'Bhoori Bhojana · meal coupon' },
  { id: 'merch', kind: 'merch', kn: 'ಪರ್ವ ಅಂಗಡಿ', en: 'Parva Angadi · merch' },
  { id: 'photo', kind: 'photo', kn: 'ಫೋಟೋ ಸ್ಟುಡಿಯೋ', en: 'Photo Studio' },
]
