// Sponsors, credited the way a film credits its backers. Each tier gets its
// own brass plate on the producers' board in Scene 7.
// TODO(content): this year's sponsors and tiers; these are Parva 2025's
// logos as stand-ins. `href` makes a plate a link to the sponsor.
export const SPONSOR_TIERS = [
  { id: 'executive', kn: 'ಕಾರ್ಯಕಾರಿ ನಿರ್ಮಾಪಕರು', en: 'Executive Producers' },
  { id: 'associate', kn: 'ಸಹಯೋಗದೊಂದಿಗೆ', en: 'In association with' },
  { id: 'media', kn: 'ಮಾಧ್ಯಮ ಸಹಯೋಗ', en: 'Media partner' },
]

export const SPONSORS = [
  { id: 'nandini', tier: 'executive', name: 'Nandini', logo: '/sponsors/s3.png', href: null },
  { id: 'insights', tier: 'executive', name: 'InsightsIAS', logo: '/sponsors/s1.jpg', href: null },
  { id: 'ruby', tier: 'executive', name: 'Ruby Travels', logo: '/sponsors/s2.jpeg', href: null },
  { id: 'heaven', tier: 'executive', name: '7th Heaven', logo: '/sponsors/s4.png', href: null },
  { id: 'alumni', tier: 'associate', name: 'NITK Surathkal Alumni', logo: '/sponsors/s5.jpeg', href: null },
  { id: 'batch23', tier: 'associate', name: 'Batch of 2023', logo: '/sponsors/s6.png', href: null },
  { id: 'daijiworld', tier: 'media', name: 'Daijiworld TV', logo: '/sponsors/s7.png', href: null },
]
