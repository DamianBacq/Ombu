import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Encabezado from './componentes/Encabezado'
import Pie from './componentes/Pie'
import CarritoPanel from './componentes/CarritoPanel'
import Inicio from './paginas/Inicio'
import Tratamientos from './paginas/Tratamientos'
import Reservar from './paginas/Reservar'
import Tienda from './paginas/Tienda'
import ProductoDetalle from './paginas/ProductoDetalle'
import Checkout from './paginas/Checkout'
import EstadoPedido from './paginas/EstadoPedido'
import EstadoTurno from './paginas/EstadoTurno'
import PagoDemo from './paginas/PagoDemo'
import PagoResultado from './paginas/PagoResultado'
import NoEncontrado from './paginas/NoEncontrado'
import Login from './panel/Login'
import Panel from './panel/Panel'

export default function App() {
  const { pathname, hash } = useLocation()
  const esPanel = pathname.startsWith('/panel')

  // Cada página nueva arranca desde arriba, salvo que el link apunte a una sección (#estudio)
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 120)
    return () => clearTimeout(t)
  }, [pathname, hash])

  if (esPanel) {
    return (
      <Routes>
        <Route path="/panel/login" element={<Login />} />
        <Route path="/panel/*" element={<Panel />} />
      </Routes>
    )
  }

  return (
    <>
      <a className="saltar" href="#contenido">Ir al contenido</a>
      <Encabezado />
      <main id="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/tratamientos" element={<Tratamientos />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/tienda/:slug" element={<ProductoDetalle />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido/:codigo" element={<EstadoPedido />} />
          <Route path="/turno/:codigo" element={<EstadoTurno />} />
          <Route path="/pago/demo" element={<PagoDemo />} />
          <Route path="/pago/resultado" element={<PagoResultado />} />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <Pie />
      <CarritoPanel />
    </>
  )
}
