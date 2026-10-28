// Single source of truth for the three literacy-event registration forms.
// `name` of every field is also the column name in the Supabase table, so the
// form values can be inserted as they are.
// Table SQL: server/sql/006_parva26_literacy_registrations.sql

const leaderFields = [
  { name: 'group_name', label: 'Group name', type: 'text', autoComplete: 'off', maxLength: 100 },
  { name: 'leader_name', label: 'Team leader name', type: 'text', autoComplete: 'name', maxLength: 100 },
  { name: 'leader_roll_no', label: 'Team leader roll no', type: 'text', autoComplete: 'off', maxLength: 20 },
  { name: 'leader_email', label: 'Team leader email', type: 'email', autoComplete: 'email', maxLength: 254 },
  { name: 'leader_phone', label: 'Phone number', type: 'tel', autoComplete: 'tel-national', maxLength: 10, inputMode: 'numeric' },
]

const member = (n, required = true) => ({
  name: `member${n}_name`,
  label: `Member ${n} name${required ? '' : ' (optional)'}`,
  type: 'text',
  autoComplete: 'off',
  maxLength: 100,
  required,
})

export const EVENTS = {
  quiz: {
    slug: 'quiz',
    path: '/parva-26/regform/quiz',
    table: 'literacy_quiz_registrations',
    title: 'Quiz',
    teamSize: 'Teams of 3–4',
    fields: [...leaderFields, member(2), member(3), member(4, false)],
  },
  proverbsandriddles: {
    slug: 'proverbsandriddles',
    path: '/parva-26/regform/proverbsandriddles',
    table: 'literacy_proverbs_riddles_registrations',
    title: 'Proverbs & Riddles',
    teamSize: 'Teams of 2',
    fields: [...leaderFields, member(2)],
  },
  filmsongchallenge: {
    slug: 'filmsongchallenge',
    path: '/parva-26/regform/filmsongchallenge',
    table: 'literacy_film_song_registrations',
    title: 'Film-song Challenge',
    teamSize: 'Teams of 4',
    fields: [...leaderFields, member(2), member(3), member(4)],
  },
}

export const EVENT_LIST = Object.values(EVENTS)

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// Returns { fieldName: 'message' } (empty object when valid).
// Mirrors the CHECK constraints in the database; the DB is the real gatekeeper.
export function validate(event, values) {
  const errors = {}
  for (const f of event.fields) {
    const v = (values[f.name] ?? '').trim()
    const required = f.required !== false
    if (!v) {
      if (required) errors[f.name] = `${f.label} is required`
      continue
    }
    if (v.length > f.maxLength) errors[f.name] = `${f.label} is too long`
    else if (f.name === 'leader_email' && !EMAIL_RE.test(v)) errors[f.name] = 'Enter a valid email address'
    else if (f.name === 'leader_phone' && !/^[0-9]{10}$/.test(v)) errors[f.name] = 'Enter a 10-digit phone number'
    else if (f.name === 'leader_roll_no' && v.length < 3) errors[f.name] = 'Enter a valid roll number'
  }
  return errors
}

// Trim everything; empty optional fields become null (stored as NULL).
export function toPayload(event, values) {
  const row = {}
  for (const f of event.fields) {
    const v = (values[f.name] ?? '').trim()
    row[f.name] = v === '' ? null : v
  }
  row.leader_email = row.leader_email?.toLowerCase() ?? null
  row.leader_roll_no = row.leader_roll_no?.toUpperCase() ?? null
  return row
}

// Turn a Supabase/Postgres error into something a student can act on.
export function friendlyError(error) {
  const msg = error?.message ?? ''
  if (error?.code === '23505') {
    if (msg.includes('group_name')) return { field: 'group_name', message: 'This group name is already registered. Pick another one.' }
    if (msg.includes('leader_roll')) return { field: 'leader_roll_no', message: 'This roll number has already registered a team for this event.' }
    if (msg.includes('leader_email')) return { field: 'leader_email', message: 'This email has already registered a team for this event.' }
    return { message: 'This team is already registered.' }
  }
  if (error?.code === '23514') return { message: 'Some details look invalid. Please check the form and try again.' }
  return { message: 'Could not submit right now. Please try again in a moment.' }
}
