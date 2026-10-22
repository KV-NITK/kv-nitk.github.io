// What the market's stalls sell (market.js): the Bhoori Bhojana meal coupon
// and the Parva tee. Prices, stock and orders come from the server; these
// are the words and pictures around them.
// The meal is on 31 October. TODO(content): the time and place are still
// stand-ins from Parva 2025's food coupon (OSC, 12:00 PM); confirm them. The
// menu below is the real one.
// The landing page shows these prices without asking the server; the coupon
// page and checkout use the database (unit_price, list_price), so keep them
// the same.
export const MEAL = {
  day: '2026-10-31',
  time: { kn: 'ಮಧ್ಯಾಹ್ನ 12:00', en: '12:00 PM' },
  venue: { kn: 'ಹಳೆ ಕ್ರೀಡಾ ಸಂಕೀರ್ಣ', en: 'Old Sports Complex (OSC)' },
  price: 249,
  listPrice: 289, // shown struck through
}

// Served onto the leaf in this order. `dish` picks the drawing.
export const MENU = [
  { id: 'uppu', dish: 'uppu', kn: 'ಉಪ್ಪು', en: 'Uppu, salt' },
  { id: 'uppinkai', dish: 'uppinkai', kn: 'ಉಪ್ಪಿನಕಾಯಿ', en: 'Uppinkai, pickle' },
  { id: 'happala', dish: 'happala', kn: 'ಹಪ್ಪಳ', en: 'Happala, papad' },
  { id: 'kosambri', dish: 'kosambri', kn: 'ಕೋಸಂಬರಿ', en: 'Kosambri, a lentil salad' },
  { id: 'mysore-pak', dish: 'mysorePak', kn: 'ಮೈಸೂರು ಪಾಕ್', en: 'Mysore pak' },
  { id: 'menasinakai-bajji', dish: 'bajji', kn: 'ಮೆಣಸಿನಕಾಯಿ ಬಜ್ಜಿ', en: 'Menasinakai bajji, chilli fritters' },
  { id: 'jolada-rotti', dish: 'rotti', kn: 'ಜೋಳದ ರೊಟ್ಟಿ', en: 'Jolada rotti, jowar flatbread' },
  { id: 'ennegai', dish: 'ennegai', kn: 'ಎಣ್ಣೆಗಾಯಿ', en: 'Ennegai, stuffed brinjal curry' },
  { id: 'payasa', dish: 'payasa', kn: 'ಪಾಯಸ', en: 'Payasa, a sweet pudding' },
  { id: 'mudde', dish: 'mudde', kn: 'ಮುದ್ದೆ', en: 'Ragi mudde' },
  { id: 'bassaru', dish: 'bassaru', kn: 'ಬಸ್ಸಾರು', en: 'Bassaru, a lentil and greens curry' },
  { id: 'palya', dish: 'palya', kn: 'ಪಲ್ಯ', en: 'Palya, a vegetable stir-fry' },
  { id: 'mavinakai-chitranna', dish: 'chitranna', kn: 'ಮಾವಿನಕಾಯಿ ಚಿತ್ರಾನ್ನ', en: 'Mavinakai chitranna, raw mango rice' },
  { id: 'anna', dish: 'rice', kn: 'ಅನ್ನ', en: 'Anna, rice' },
  { id: 'rasa', dish: 'rasa', kn: 'ರಸಂ', en: 'Rasam' },
  { id: 'majjige', dish: 'majjige', kn: 'ಮಜ್ಜಿಗೆ', en: 'Majjige, buttermilk' },
]

// How the merch shop draws each tee design, in the catalog's order (the
// names, sizes and prices come from the server). `photos` swaps the drawn
// tee for real photos.
export const TEE = {
  name: { kn: 'ಪರ್ವ ಟೀ ಶರ್ಟ್', en: 'Parva T-shirt' },
  variants: [
    { id: 'orange', kn: 'ಕಿತ್ತಳೆ', en: 'Orange (Regular Fit)', body: '#f0803c', print: '#000000', ink: '#ffffff', photos: { front: '/parva26/orange_regular_frontview.png', back: '/parva26/orange_regular_backview.png' } },
    { id: 'purple', kn: 'ನೇರಳೆ', en: 'Purple (Oversized)', body: '#6a0dad', print: '#000000', ink: '#ffffff', photos: { front: '/parva26/purple_oversized_frontview.png', back: '/parva26/purple_oversized_backview.png' } },
  ],
}
