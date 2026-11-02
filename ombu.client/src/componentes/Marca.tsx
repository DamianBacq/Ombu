import { Link } from 'react-router-dom'

// El logo: un arco (la copa del ombú) con un punto
export default function Marca({ alHacerClick }: { alHacerClick?: () => void }) {
  return (
    <Link to="/" className="marca" aria-label="Ombú, ir al inicio" onClick={alHacerClick}>
      <svg viewBox="0 0 26 30" aria-hidden="true">
        <path d="M3 29V13a10 10 0 0 1 20 0v16" fill="none" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="13" cy="15" r="3.4" fill="#8E6FB8" />
      </svg>
      ombú
    </Link>
  )
}
