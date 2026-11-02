import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { guardarToken, leerToken } from '../api'
import Marca from '../componentes/Marca'
import { useApi } from '../useApi'
import type { Resumen as DatosResumen } from '../tipos'
import Resumen from './Resumen'
import Pedidos from './Pedidos'
import Agenda from './Agenda'
import Productos from './Productos'
import TratamientosPanel from './TratamientosPanel'
import Consultas from './Consultas'
import './panel.css'

export default function Panel() {
  const navegar = useNavigate()
  const token = leerToken()
  const resumen = useApi<DatosResumen>(token ? '/api/Panel/resumen' : null)

  if (!token) return <Navigate to="/panel/login" replace />

  function salir() {
    guardarToken(null)
    navegar('/panel/login')
  }

  return (
    <div className="panel">
      <nav className="panel-menu" aria-label="Panel">
        <Marca />
        <NavLink to="/panel" end>Resumen</NavLink>
        <NavLink to="/panel/pedidos">
          Pedidos {!!resumen.datos?.pedidosPorPreparar && <span className="aviso">{resumen.datos.pedidosPorPreparar}</span>}
        </NavLink>
        <NavLink to="/panel/agenda">Agenda</NavLink>
        <NavLink to="/panel/productos">Productos</NavLink>
        <NavLink to="/panel/tratamientos">Tratamientos</NavLink>
        <NavLink to="/panel/consultas">
          Consultas {!!resumen.datos?.consultasSinLeer && <span className="aviso">{resumen.datos.consultasSinLeer}</span>}
        </NavLink>
        <div className="abajo">
          <a href="/" target="_blank" rel="noreferrer">Ver la página</a>
          <button onClick={salir}>Salir</button>
        </div>
      </nav>
      <main className="panel-contenido">
        <Routes>
          <Route index element={<Resumen datos={resumen.datos} cargando={resumen.cargando} />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="agenda" element={<Agenda />} />
          <Route path="productos" element={<Productos />} />
          <Route path="tratamientos" element={<TratamientosPanel />} />
          <Route path="consultas" element={<Consultas />} />
        </Routes>
      </main>
    </div>
  )
}
