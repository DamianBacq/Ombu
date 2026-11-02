import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { precio } from '../formato'
import type { Tratamiento } from '../tipos'

// Lista editorial de tratamientos. En escritorio, la foto sigue al mouse.
export default function ListaTratamientos({ tratamientos }: { tratamientos: Tratamiento[] }) {
  const [imagen, setImagen] = useState('')
  const [visible, setVisible] = useState(false)
  const previa = useRef<HTMLDivElement>(null)

  function mover(e: React.MouseEvent) {
    if (previa.current) {
      previa.current.style.left = `${e.clientX + 150}px`
      previa.current.style.top = `${e.clientY}px`
    }
  }

  return (
    <>
      <ul className="lista-tratamientos" onMouseMove={mover} onMouseLeave={() => setVisible(false)}>
        {tratamientos.map((t) => (
          <li key={t.id} className="fila-tratamiento" onMouseEnter={() => (setImagen(t.imagen), setVisible(true))}>
            <Link to={`/reservar?tratamiento=${t.slug}`}>
              <img className="miniatura-tratamiento" src={t.imagen} alt="" loading="lazy" />
              <div>
                <h3>{t.nombre}</h3>
                <p>{t.resumen}</p>
              </div>
              <span className="duracion">{t.duracionMinutos} min</span>
              <span className="valor">{precio(t.precio)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div ref={previa} className={`vista-previa ${visible ? 'visible' : ''}`} aria-hidden="true">
        {imagen && <img src={imagen} alt="" />}
      </div>
    </>
  )
}
