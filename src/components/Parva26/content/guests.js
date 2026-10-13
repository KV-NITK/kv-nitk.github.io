import karajagiPhoto from '@p26/assets/guests/gururaj-karajagi.webp'
import nagabharanaPhoto from '@p26/assets/guests/ts-nagabharana.webp'
import krishnegowdaPhoto from '@p26/assets/guests/krishnegowda.webp'
import sulibelePhoto from '@p26/assets/guests/chakravarthi-sulibele.webp'
import hegdePhoto from '@p26/assets/guests/santosh-hegde.webp'
import baligarPhoto from '@p26/assets/guests/shambhu-baligar.webp'
import kiranPhoto from '@p26/assets/guests/kiran-raj.webp'
import naveenPhoto from '@p26/assets/guests/naveen-shankar.webp'
import shravanPhoto from '@p26/assets/guests/shravan.webp'
import nithinPhoto from '@p26/assets/guests/nithin-kamath.webp'
import vinayakPhoto from '@p26/assets/guests/vinayak-kulkarni.webp'
import harshaPhoto from '@p26/assets/guests/shree-harsha.webp'
import bhavanaPhoto from '@p26/assets/guests/bhavvana-rao.webp'

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

// Guests of past Parvas, framed on the same wall with their lamps lit, in
// the order of the "Guests till now" page of the 2026 brochure. Photos are
// cropped to 3:4 around the face.
// TODO(content): confirm the Kannada spellings with each guest; a `role`
// ({ kn, en }) puts a ribbon under a guest's nameplate.
export const PAST_GUESTS = [
  { id: 'karajagi', photo: karajagiPhoto, name: { kn: 'ಡಾ. ಗುರುರಾಜ ಕರಜಗಿ', en: 'Dr. Gururaj Karajagi' } },
  { id: 'nagabharana', photo: nagabharanaPhoto, name: { kn: 'ಟಿ. ಎಸ್. ನಾಗಾಭರಣ', en: 'T. S. Nagabharana' } },
  { id: 'krishnegowda', photo: krishnegowdaPhoto, name: { kn: 'ಪ್ರೊ. ಕೃಷ್ಣೇಗೌಡ', en: 'Prof. Krishnegowda' } },
  { id: 'sulibele', photo: sulibelePhoto, name: { kn: 'ಚಕ್ರವರ್ತಿ ಸೂಲಿಬೆಲೆ', en: 'Chakravarthi Sulibele' } },
  { id: 'hegde', photo: hegdePhoto, name: { kn: 'ನ್ಯಾ. ಎನ್. ಸಂತೋಷ್ ಹೆಗ್ಡೆ', en: 'Justice N. Santosh Hegde' } },
  { id: 'baligar', photo: baligarPhoto, name: { kn: 'ಡಾ. ಶಂಭು ಬಳಿಗಾರ', en: 'Dr. Shambhu Baligar' } },
  { id: 'kiran', photo: kiranPhoto, name: { kn: 'ಕಿರಣ್ ರಾಜ್', en: 'Kiran Raj' } },
  { id: 'naveen', photo: naveenPhoto, name: { kn: 'ನವೀನ್ ಶಂಕರ್', en: 'Naveen Shankar' } },
  { id: 'shravan', photo: shravanPhoto, name: { kn: 'ಶ್ರವಣ್', en: 'Shravan' } },
  { id: 'nithin', photo: nithinPhoto, name: { kn: 'ನಿತಿನ್ ಕಾಮತ್', en: 'Nithin Kamath' } },
  { id: 'vinayak', photo: vinayakPhoto, name: { kn: 'ವಿನಾಯಕ ಕುಲಕರ್ಣಿ', en: 'Vinayak Kulkarni' } },
  { id: 'harsha', photo: harshaPhoto, name: { kn: 'ಶ್ರೀಹರ್ಷ', en: 'Shree Harsha' } },
  { id: 'bhavana', photo: bhavanaPhoto, name: { kn: 'ಭಾವನಾ ರಾವ್', en: 'Bhavana Rao' } },
]
