// What the market's stalls sell (market.js): the Bhoori Bhojana meal coupon
// and the Parva tee. Prices, stock and orders come from the server; these
// are the words and pictures around them.
// TODO(content): stand-ins from Parva 2025's food coupon (OSC, 12:00 PM,
// ₹199) moved to this year's last day; confirm the day, time, place, price
// and the menu with its serving order (from the caterer).
export const MEAL = {
  day: '2026-11-01',
  time: { kn: 'ಮಧ್ಯಾಹ್ನ 12:00', en: '12:00 PM' },
  venue: { kn: 'ಹಳೆ ಕ್ರೀಡಾ ಸಂಕೀರ್ಣ', en: 'Old Sports Complex (OSC)' },
  price: 199,
}

// Served onto the leaf in this order. `dish` picks the drawing.
export const MENU = [
  { id: 'chapati', dish: 'chapati', kn: 'ಚಪಾತಿ', en: 'Chapati' },
  { id: 'sukka', dish: 'sukka', kn: 'ಸುಕ್ಕ', en: 'Sukka, a dry coconut masala' },
  { id: 'kabab', dish: 'kabab', kn: 'ಕಬಾಬ್', en: 'Kabab' },
  { id: 'gassi', dish: 'bowl', kn: 'ಗಸಿ', en: 'Gassi, a coconut curry' },
  { id: 'ghee-rice', dish: 'gheeRice', kn: 'ತುಪ್ಪದ ಅನ್ನ', en: 'Ghee rice' },
  { id: 'rice', dish: 'rice', kn: 'ಅನ್ನ', en: 'Rice' },
  { id: 'vada', dish: 'vada', kn: 'ವಡೆ', en: 'Vada' },
  { id: 'sweet', dish: 'sweet', kn: 'ಸಿಹಿ', en: 'A sweet' },
  { id: 'curd', dish: 'curd', kn: 'ಮೊಸರು', en: 'Curd' },
]

// How the merch shop draws each tee design, in the catalog's order (the
// names, sizes and prices come from the server). `photos` swaps the drawn
// tee for real photos.
export const TEE = {
  name: { kn: 'ಪರ್ವ ಟೀ ಶರ್ಟ್', en: 'Parva T-shirt' },
  variants: [
    { id: 'orange', kn: 'ಕಿತ್ತಳೆ', en: 'Orange (Regular Fit)', body: '#f0803c', print: '#000000', ink: '#ffffff', photos: { front: '/parva-26/orange_regular_frontview.png', back: '/parva-26/orange_regular_backview.png' } },
    { id: 'purple', kn: 'ನೇರಳೆ', en: 'Purple (Oversized)', body: '#6a0dad', print: '#000000', ink: '#ffffff', photos: { front: '/parva-26/purple_oversized_frontview.png', back: '/parva-26/purple_oversized_backview.png' } },
  ],
}
