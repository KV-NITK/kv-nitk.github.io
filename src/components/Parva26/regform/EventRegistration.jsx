import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { validate, toPayload, friendlyError } from './events'

// One registration form for any literacy event. Pass an entry from EVENTS.
// Markup is plain on purpose (class names `regform-*`), ready for your styling.
export default function EventRegistration({ event }) {
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success
  const [formError, setFormError] = useState('')

  const onChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: name === 'leader_phone' ? value.replace(/\D/g, '') : value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (status === 'submitting') return
    setFormError('')

    // Honeypot: real users never see this field. Bots fill it; pretend success.
    if (values.website) return setStatus('success')

    const found = validate(event, values)
    setErrors(found)
    if (Object.keys(found).length) return

    if (!supabase) return setFormError('Registration is not configured yet. Please contact the organisers.')

    setStatus('submitting')
    // No .select(): anon may insert but not read, so don't ask for the row back.
    const { error } = await supabase.from(event.table).insert(toPayload(event, values))
    if (error) {
      console.error('Supabase insert error:', error)
      const { field, message } = friendlyError(error)
      if (field) setErrors({ [field]: message })
      else setFormError(message)
      return setStatus('idle')
    }
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <main className="regform regform-success">
        <h1>You're registered for {event.title}!</h1>
        <p>Team <strong>{values.group_name}</strong> is in. See you at Parva 26.</p>
        <Link to="/parva-26/regform">Register for another event</Link>
      </main>
    )
  }

  return (
    <main className="regform">
      <Link to="/parva-26/regform" className="regform-back">← All events</Link>
      <h1>{event.title} registration</h1>
      <p>{event.teamSize}</p>

      <form onSubmit={onSubmit} noValidate className="regform-form">
        {event.fields.map((f) => (
          <div key={f.name} className="regform-field">
            <label htmlFor={f.name}>{f.label}</label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              inputMode={f.inputMode}
              autoComplete={f.autoComplete}
              maxLength={f.maxLength}
              required={f.required !== false}
              value={values[f.name] ?? ''}
              onChange={onChange}
              aria-invalid={!!errors[f.name]}
              aria-describedby={errors[f.name] ? `${f.name}-error` : undefined}
            />
            {errors[f.name] && <p id={`${f.name}-error`} role="alert" className="regform-error">{errors[f.name]}</p>}
          </div>
        ))}

        {/* honeypot */}
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
          <label>Website <input name="website" tabIndex={-1} autoComplete="off" value={values.website ?? ''} onChange={onChange} /></label>
        </div>

        {formError && <p role="alert" className="regform-error">{formError}</p>}
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Submitting…' : 'Register'}
        </button>
      </form>
    </main>
  )
}
