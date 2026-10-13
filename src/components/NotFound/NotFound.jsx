import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 16px 64px',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.25rem', margin: '12px 0 24px' }}>
        This page could not be found.
      </p>
      <Link to="/" style={{ textDecoration: 'underline' }}>
        Back to home
      </Link>
    </main>
  );
}
