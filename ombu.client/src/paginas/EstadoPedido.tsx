import { Link, useParams } from 'react-router-dom'
import { enviar } from '../api'
import { IconoCheck, IconoAlerta, IconoEspera } from '../componentes/Iconos'
import { fechaLarga, hora, precio } from '../formato'
import { useApi } from '../useApi'
import type { EstadoPedido as Estado, Pedido } from '../tipos'
import NoEncontrado from './NoEncontrado'

const ETAPAS_ENVIO: Estado[] = ['Pagado', 'Preparando', 'Enviado', 'Entregado']
const ETAPAS_RETIRO: Estado[] = ['Pagado', 'Preparando', 'Entregado']

export default function EstadoPedido() {
  const { codigo } = useParams()
  const { datos: pedido, cargando, error } = useApi<Pedido>(`/api/Pedidos/${codigo}`)

  if (cargando) return <div className="cargando"><div className="giro" /></div>
  if (error || !pedido) return <NoEncontrado />

  const etapas = pedido.entrega === 'Envio' ? ETAPAS_ENVIO : ETAPAS_RETIRO
  const actual = etapas.indexOf(pedido.estado)
  const nombres: Record<string, string> = { Pagado: 'Pagado', Preparando: 'Preparando', Enviado: 'En camino', Entregado: pedido.entrega === 'Envio' ? 'Entregado' : 'Retirado' }

  return (
    <div className="contenedor">
      <div className="tarjeta-estado">
        {pedido.estado === 'Cancelado' ? (
          <>
            <div className="icono-estado mal"><IconoAlerta /></div>
            <h1>Pedido cancelado</h1>
            <p className="texto-2">El pago no se completó a tiempo y liberamos los productos. Podés volver a armar tu pedido cuando quieras.</p>
          </>
        ) : pedido.estado === 'PendientePago' ? (
          <>
            <div className="icono-estado espera"><IconoEspera /></div>
            <h1>Esperando el pago</h1>
            <p className="texto-2">Todavía no recibimos la confirmación de Mercado Pago. Si ya pagaste, en unos minutos se actualiza.</p>
            <div>
              <button className="boton" onClick={() => enviar<{ url: string }>(`/api/Pagos/pedido/${codigo}`, 'POST').then((p) => (window.location.href = p.url))}>Pagar {precio(pedido.total)}</button>
            </div>
          </>
        ) : (
          <>
            <div className="icono-estado"><IconoCheck /></div>
            <h1>¡Gracias, {pedido.cliente.nombre}!</h1>
            <p className="texto-2">
              {pedido.entrega === 'Envio'
                ? `Tu pedido va a ${pedido.direccion}, ${pedido.localidad}. Te avisamos por mail cuando salga.`
                : 'Te avisamos por mail cuando esté listo para retirar en el estudio.'}
            </p>
            <ol className="seguimiento" style={{ gridTemplateColumns: `repeat(${etapas.length}, 1fr)` }}>
              {etapas.map((e, i) => <li key={e} className={i <= actual ? 'hecho' : ''}>{nombres[e]}</li>)}
            </ol>
          </>
        )}

        <dl className="lista-datos">
          {pedido.items.map((i) => (
            <div key={i.productoId}><dt>{i.cantidad} × {i.nombre}</dt><dd>{precio(i.precio * i.cantidad)}</dd></div>
          ))}
          <div><dt>Envío</dt><dd>{pedido.costoEnvio ? precio(pedido.costoEnvio) : 'Gratis'}</dd></div>
          <div><dt>Total</dt><dd>{precio(pedido.total)}</dd></div>
          <div><dt>Fecha</dt><dd>{fechaLarga(pedido.fecha)}, {hora(pedido.fecha)} hs</dd></div>
          <div><dt>Número de pedido</dt><dd>#{String(pedido.id).padStart(5, '0')}</dd></div>
        </dl>
        <div><Link to="/tienda" className="boton boton-claro">Seguir comprando</Link></div>
      </div>
    </div>
  )
}
