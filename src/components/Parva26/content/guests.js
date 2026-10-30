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
import someswaraPhoto from '@p26/assets/guests/na-someswara.webp'
import pruthviPhoto from '@p26/assets/guests/pruthvi-ambaar.webp'
import dilipPhoto from '@p26/assets/guests/dilip-shankar.webp'
import gahanaPhoto from '@p26/assets/guests/gahana-band.webp'

// Scene 7: ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ · Special Appearance, the lobby's wall of honour.
// This year's guests were unveiled together at the flashmob on 29 October;
// a visitor still sees each one unveiled once, the first time the frame
// comes into view. Photos are cropped to 3:4 from the guest posters.
// TODO(backend): fetch these (step 16). TODO(content): Kannada roles to be
// proofread. `place` is the frame's spot on the wall, left to right, with
// the Chief Guest next to the middle.
export const UNVEILING = {
  date: '2026-10-29',
  hint: { kn: 'ಫ್ಲ್ಯಾಶ್‌ಮಾಬ್‌ನಲ್ಲಿ ಅನಾವರಣ', en: 'Unveiled at the flashmob' },
}

export const GUESTS = [
  {
    id: 'pruthvi',
    place: 0,
    revealDate: UNVEILING.date,
    photo: pruthviPhoto,
    name: { kn: 'ಪೃಥ್ವಿ ಅಂಬಾರ್', en: 'Pruthvi Ambaar' },
    role: { kn: 'ಗೌರವ ಅತಿಥಿ', en: 'Guest of Honour' },
    card: { when: { kn: 'ಅಕ್ಟೋಬರ್ 31 · ಸಂಜೆ 4:30', en: '31 Oct, 4:30 PM, SJA' } },
  },
  {
    id: 'chief',
    place: 1,
    chief: true,
    revealDate: UNVEILING.date,
    photo: someswaraPhoto,
    name: { kn: 'ಡಾ. ನಾ. ಸೋಮೇಶ್ವರ', en: 'Dr. Na. Someswara' },
    role: { kn: 'ಮುಖ್ಯ ಅತಿಥಿ', en: 'Chief Guest' },
    card: { when: { kn: 'ಅಕ್ಟೋಬರ್ 31 · ಸಂಜೆ 4:30', en: '31 Oct, 4:30 PM, SJA' } },
  },
  {
    id: 'dilip',
    place: 2,
    revealDate: UNVEILING.date,
    photo: dilipPhoto,
    name: { kn: 'ದಿಲೀಪ್ ಶಂಕರ್', en: 'Dilip Shankar' },
    role: { kn: 'ಹಾಸ್ಯ ಕಲಾವಿದ', en: 'Comedian' },
    // TODO(content): one poster says 9:00 PM, the other 4:30 PM
    card: { when: { kn: 'ಅಕ್ಟೋಬರ್ 31 · ರಾತ್ರಿ 9:00', en: '31 Oct, 9:00 PM, SJA' }, line: 'An evening of stand-up comedy.', link: '#now-showing' },
  },
  {
    id: 'gahana',
    place: 3,
    revealDate: UNVEILING.date,
    photo: gahanaPhoto,
    name: { kn: 'ಗಹನ ಬ್ಯಾಂಡ್', en: 'Gahana Band' },
    role: { kn: 'ಸಂಗೀತ ತಂಡ', en: 'Band' },
    card: { when: { kn: 'ನವೆಂಬರ್ 1 · ರಾತ್ರಿ 8:00', en: '1 Nov, 8:00 PM, SAC' }, line: 'A live music concert to close Parva.', link: '#now-showing' },
  },
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
