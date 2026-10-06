// Scene 8: ವಿರಾಮ · Interval. Two things are sold: the Bhoori Bhojana meal
// coupon and the Parva tee.
// TODO(content): stand-ins from Parva 2025's food coupon (OSC, 12:00 PM,
// ₹199) moved to this year's last day; confirm the day, time, place, price,
// number of coupons and the menu with its serving order (from the caterer).
// TODO(backend): `sold` comes from the server; `bookLink` goes to payment.
export const MEAL = {
  day: '2026-11-01',
  time: { kn: 'ಮಧ್ಯಾಹ್ನ 12:00', en: '12:00 PM' },
  venue: { kn: 'ಹಳೆ ಕ್ರೀಡಾ ಸಂಕೀರ್ಣ', en: 'Old Sports Complex (OSC)' },
  price: 199,
  coupons: 300,
  sold: 162,
  bookLink: '#',
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

// The tee, in two variants. `photos` swaps the drawn tee for real photos.
// TODO(content): real designs, prices, the early-price quota, sizes in stock
// and the order deadline. TODO(backend): stock and `earlySold` from the
// server; `buyLink` goes to payment.
export const TEE = {
  name: { kn: 'ಪರ್ವ ಟೀ ಶರ್ಟ್', en: 'Parva T-shirt' },
  earlyQuota: 50,
  earlySold: 32,
  closes: '2026-10-20',
  buyLink: '#',
  variants: [
    { id: 'orange', kn: 'ಕಿತ್ತಳೆ', en: 'Orange (Regular Fit)', body: '#f0803c', print: '#000000', ink: '#ffffff', photos: { front: '/parva-26/orange_regular_frontview.png', back: '/parva-26/orange_regular_backview.png' }, soldOut: [], price: 329, earlyPrice: 329 },
    { id: 'purple', kn: 'ನೇರಳೆ', en: 'Purple (Oversized)', body: '#6a0dad', print: '#000000', ink: '#ffffff', photos: { front: '/parva-26/purple_oversized_frontview.png', back: '/parva-26/purple_oversized_backview.png' }, soldOut: [], price: 399, earlyPrice: 399 },
  ],
  sizes: [
    { id: 'S', chest: 38, length: 27 },
    { id: 'M', chest: 40, length: 28 },
    { id: 'L', chest: 42, length: 29 },
    { id: 'XL', chest: 44, length: 30 },
    { id: 'XXL', chest: 46, length: 31 },
  ],
}
