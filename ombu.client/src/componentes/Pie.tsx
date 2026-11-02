import { Link } from 'react-router-dom'
import Marca from './Marca'

export default function Pie() {
  return (
    <footer className="pie">
      <div className="contenedor">
        <div className="grilla">
          <div>
            <Marca />
            <p>Estudio de piel y bienestar en Lomas de Zamora. Tratamientos sin apuro y productos que usamos todos los días.</p>
          </div>
          <div>
            <h4>Estudio</h4>
            <ul>
              <li><Link to="/tratamientos">Tratamientos</Link></li>
              <li><Link to="/reservar">Reservar turno</Link></li>
              <li><Link to={{ pathname: '/', hash: '#contacto' }}>Horarios y ubicación</Link></li>
            </ul>
          </div>
          <div>
            <h4>Tienda</h4>
            <ul>
              <li><Link to="/tienda">Todos los productos</Link></li>
              <li><Link to="/tienda?categoria=serums">Sérums y aceites</Link></li>
              <li><Link to="/tienda?categoria=regalos">Regalos</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              <li>Calle Ejemplo 1234, Lomas de Zamora</li>
              <li><a href="https://wa.me/5491100000000" target="_blank" rel="noreferrer">WhatsApp 11 0000-0000</a></li>
              <li><a href="mailto:hola@ombu.example">hola@ombu.example</a></li>
            </ul>
          </div>
        </div>
        <div className="legal">
          <span>Ombú es una marca ficticia: este sitio es una demostración.</span>
          <Link to="/panel">Acceso del estudio</Link>
        </div>
      </div>
    </footer>
  )
}
