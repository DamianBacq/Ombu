import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCarrito } from '../carrito'
import Marca from './Marca'
import { IconoBolsa, IconoCerrar, IconoMenu } from './Iconos'

export default function Encabezado() {
  const { cantidadTotal, abrir } = useCarrito()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [conBorde, setConBorde] = useState(false)
  const [salta, setSalta] = useState(false)
  const cantidadAnterior = useRef(cantidadTotal)
  const { pathname } = useLocation()

  useEffect(() => {
    const alScrollear = () => setConBorde(window.scrollY > 8)
    window.addEventListener('scroll', alScrollear, { passive: true })
    return () => window.removeEventListener('scroll', alScrollear)
  }, [])

  // El contador "salta" cuando se agrega algo
  useEffect(() => {
    if (cantidadTotal > cantidadAnterior.current) {
      setSalta(true)
      const t = setTimeout(() => setSalta(false), 500)
      cantidadAnterior.current = cantidadTotal
      return () => clearTimeout(t)
    }
    cantidadAnterior.current = cantidadTotal
  }, [cantidadTotal])

  useEffect(() => {
    document.body.style.overflow = menuAbierto ? 'hidden' : ''
  }, [menuAbierto])

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <header className={`encabezado ${conBorde || menuAbierto ? 'con-borde' : ''}`}>
      <div className="contenedor">
        <Marca alHacerClick={cerrarMenu} />
        <nav className="nav" aria-label="Principal">
          <NavLink to="/tratamientos">Tratamientos</NavLink>
          <NavLink to="/tienda">Tienda</NavLink>
          <Link to={{ pathname: '/', hash: '#estudio' }} className={pathname === '/' ? '' : undefined}>El estudio</Link>
          <Link to={{ pathname: '/', hash: '#contacto' }}>Contacto</Link>
        </nav>
        <div className="acciones-encabezado">
          <Link to="/reservar" className="boton boton-chico solo-escritorio">Reservar turno</Link>
          <button className="boton-icono" onClick={abrir} aria-label={`Abrir carrito, ${cantidadTotal} productos`}>
            <IconoBolsa />
            {cantidadTotal > 0 && <span className={`contador ${salta ? 'salta' : ''}`}>{cantidadTotal}</span>}
          </button>
          <button
            className="boton-icono solo-celular"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
          >
            {menuAbierto ? <IconoCerrar /> : <IconoMenu />}
          </button>
        </div>
      </div>
      {menuAbierto && (
        <nav className="menu-celular" aria-label="Menú">
          <Link to="/tratamientos" onClick={cerrarMenu}>Tratamientos</Link>
          <Link to="/tienda" onClick={cerrarMenu}>Tienda</Link>
          <Link to={{ pathname: '/', hash: '#estudio' }} onClick={cerrarMenu}>El estudio</Link>
          <Link to={{ pathname: '/', hash: '#contacto' }} onClick={cerrarMenu}>Contacto</Link>
          <Link to="/reservar" className="boton" onClick={cerrarMenu}>Reservar turno</Link>
        </nav>
      )}
    </header>
  )
}
