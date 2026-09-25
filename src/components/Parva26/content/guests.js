import baligarPhoto from '@p26/assets/guests/shambhu-baligar.webp'
import bhavvanaPhoto from '@p26/assets/guests/bhavvana-rao.webp'
import vinayakPhoto from '@p26/assets/guests/vinayak-kulkarni.webp'

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
