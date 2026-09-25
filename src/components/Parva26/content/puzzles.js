// Scene 11: ಯಾವ ಸಿನಿಮಾ? · Which film? Each puzzle: three Twemoji (by
// code point, from assets/emoji), plain alt text that describes the
// pictures without giving the answer away, the answer, other spellings
// people will type, and the year for the first hint.
// TODO(content): 40+ puzzles from the club. TODO(backend): these answers
// must move to the server (answers checked there, spec §3 Scene 11); in the
// page they can be read by anyone who looks.
export const EMOJI_PUZZLES = [
  { id: 'mungaru-male', emoji: ['1f327', '1f430', '1f494'], alt: 'rain cloud, rabbit, broken heart', answer: { kn: 'ಮುಂಗಾರು ಮಳೆ', en: 'Mungaru Male' }, accept: ['mungaaru male', 'mungarumale'], year: 2006 },
  { id: 'kgf', emoji: ['26cf', '1f4b0', '1f451'], alt: 'pick, money bag, crown', answer: { kn: 'ಕೆ.ಜಿ.ಎಫ್', en: 'K.G.F' }, accept: ['kgf chapter 1', 'kgf 1', 'kgf chapter one', 'ಕೆಜಿಎಫ್'], year: 2018 },
  { id: 'kantara', emoji: ['1f417', '1f525', '1f333'], alt: 'boar, fire, tree', answer: { kn: 'ಕಾಂತಾರ', en: 'Kantara' }, accept: ['kanthara'], year: 2022 },
  { id: 'lucia', emoji: ['1f48a', '1f634', '1f3ac'], alt: 'pill, sleeping face, clapper board', answer: { kn: 'ಲೂಸಿಯಾ', en: 'Lucia' }, accept: ['ಲೂಸಿಯ'], year: 2013 },
  { id: 'naagarahaavu', emoji: ['1f40d', '1f393', '1f620'], alt: 'snake, graduation cap, angry face', answer: { kn: 'ನಾಗರಹಾವು', en: 'Naagarahaavu' }, accept: ['nagarahavu', 'nagarahaavu', 'naagarahavu', 'nagara haavu'], year: 1972 },
  { id: 'gandhada-gudi', emoji: ['1f6d5', '1f333', '1f418'], alt: 'temple, tree, elephant', answer: { kn: 'ಗಂಧದ ಗುಡಿ', en: 'Gandhada Gudi' }, accept: ['gandada gudi', 'gandhadagudi'], year: 1973 },
  { id: 'bangarada-manushya', emoji: ['1f947', '1f468-200d-1f33e', '1f33e'], alt: 'gold medal, farmer, sheaf of rice', answer: { kn: 'ಬಂಗಾರದ ಮನುಷ್ಯ', en: 'Bangarada Manushya' }, accept: ['bangaarada manushya', 'bangarada manushyaa'], year: 1972 },
  { id: 'kirik-party', emoji: ['1f3eb', '1f389', '1f61c'], alt: 'school, party popper, winking face with tongue', answer: { kn: 'ಕಿರಿಕ್ ಪಾರ್ಟಿ', en: 'Kirik Party' }, accept: ['kirick party', 'kirikparty'], year: 2016 },
  { id: 'rangitaranga', emoji: ['1f308', '1f30a', '1f47b'], alt: 'rainbow, water wave, ghost', answer: { kn: 'ರಂಗಿತರಂಗ', en: 'RangiTaranga' }, accept: ['rangi taranga'], year: 2015 },
  { id: 'ondu-motteya-kathe', emoji: ['31-20e3', '1f95a', '1f4d6'], alt: 'number one, egg, open book', answer: { kn: 'ಒಂದು ಮೊಟ್ಟೆಯ ಕಥೆ', en: 'Ondu Motteya Kathe' }, accept: ['ondu motteya kate', 'ondu motteya katha'], year: 2017 },
]

// Today's top 10 on the booth's duty chart. TODO(backend): the real board,
// reset at midnight, with the bad-word filter; these are stand-ins.
export const DUTY_CHART = [
  { name: 'ರಾಜು', score: 431 },
  { name: 'Ananya', score: 408 },
  { name: 'ಶ್ವೇತಾ', score: 377 },
  { name: 'Kiran M', score: 352 },
  { name: 'ಮಂಜು', score: 318 },
  { name: 'Sahana', score: 296 },
  { name: 'Arjun S', score: 271 },
  { name: 'ಪೂಜಾ', score: 244 },
  { name: 'Rohit', score: 219 },
  { name: 'ದೀಪಕ್', score: 186 },
]
