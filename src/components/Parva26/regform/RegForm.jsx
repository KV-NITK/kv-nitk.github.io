import { Link } from 'react-router-dom'
import { EVENT_LIST } from './events'

// /parva-26/regform: pick an event, then go to its own form.
export default function RegForm() {
  return (
    <main className="regform regform-chooser">
      <h1>Parva 26 · Literary events registration</h1>
      <p>Choose the event you want to register for.</p>
      <ul>
        {EVENT_LIST.map((e) => (
          <li key={e.slug}>
            <Link to={e.path}>
              <strong>{e.title}</strong> <span>{e.teamSize}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
