/**
 * Hardcoded team stats for the Hudugata Hudakata 2026 treasure hunt.
 *
 * Each team has a name, leader, members, and a `trail` array describing
 * their step-by-step progress through the 10-location clue chain.
 *
 * Replace the placeholder clues/locations with real data after the event.
 */

export const TOTAL_STEPS = 10

export const locations = [
  'Sambhram Entrance',
  'Library Clock Tower',
  'Amphitheatre Steps',
  'Old Canteen Banyan Tree',
  'E-library',
  'SAC Courtyard',
  'Tennis Court Wall',
  'Mega Mess Garden',
  'Workshop Archway',
  'The Vault — East Campus Gate',
]

export const teams = [
  {
    name: 'Thusu Daksha Squad',
    leader: 'Varun Hegde',
    members: ['Ishita S.', 'Pranav Nayak', 'Shreya D.'],
    trail: [
      {
        step: 0,
        clue: 'Where the seekers first gather and names are etched in gold, your journey begins where stories are told.',
        location: locations[0],
        unlocked: true,
      },
      {
        step: 1,
        clue: 'Time stands still for those who read, but the keeper of hours holds what you need. Look up, not down.',
        location: locations[1],
        unlocked: true,
      },
      {
        step: 2,
        clue: 'Where applause once echoed under open skies, count the seats in the third row — that number is your prize.',
        location: locations[2],
        unlocked: true,
      },
      {
        step: 3,
        clue: 'Roots deeper than memory, shade wider than doubt. The oldest witness on campus — seek the hollow knot out.',
        location: locations[3],
        unlocked: true,
      },
      {
        step: 4,
        clue: 'Corridors of wisdom, pillars of stone. The fifth window from the left hides a secret of its own.',
        location: locations[4],
        unlocked: true,
      },
      {
        step: 5,
        clue: null,
        location: locations[5],
        unlocked: false,
      },
      {
        step: 6,
        clue: null,
        location: locations[6],
        unlocked: false,
      },
      {
        step: 7,
        clue: null,
        location: locations[7],
        unlocked: false,
      },
      {
        step: 8,
        clue: null,
        location: locations[8],
        unlocked: false,
      },
      {
        step: 9,
        clue: null,
        location: locations[9],
        unlocked: false,
      },
    ],
  },
]

