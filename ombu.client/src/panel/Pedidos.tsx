import { Fragment, useState } from 'react'
import { enviar } from '../api'
import { fechaCorta, hora, precio } from '../formato'
import { useApi } from '../useApi'
import type { EstadoPedido, Pedido } from '../tipos'

const FILTROS: { valor: string; nombre: string }[] = [
  { valor: 'pendientes', nombre: 'Por preparar' },
  { valor: 'Enviado', nombre: 'Enviados' },
  { valor: 'Entregado', nombre: 'Entregados' },
  { valor: 'PendientePago', nombre: 'Sin pagar' },
  { valor: 'Cancelado', nombre: 'Cancelados' },
  { valor: 'todos', nombre: 'Todos' },
]

const NOMBRE_ESTADO: Record<EstadoPedido, string> = {
  PendientePago: 'Sin pagar', Pagado: 'Pagado', Preparando: 'Preparando', Enviado: 'Enviado', Entregado: 'Entregado', Cancelado: 'Cancelado',
}

// El siguiente paso de cada pedido según cómo se entrega
function siguiente(p: Pedido): { estado: EstadoPedido; texto: string } | null {
  if (p.estado === 'Pagado') return { estado: 'Preparando', texto: 'Empezar a preparar' }
  if (p.estado === 'Preparando') return p.entrega === 'Envio' ? { estado: 'Enviado', texto: 'Marcar enviado' } : { estado: 'Entregado', texto: 'Marcar retirado' }
  if (p.estado === 'Enviado') return { estado: 'Entregado', texto: 'Marcar entregado' }
  return null
}

export default function Pedidos() {
  const { datos, cargando, error, setDatos } = useApi<Pedido[]>('/api/Panel/pedidos')
  const [filtro, setFiltro] = useState('pendientes')
  const [abierto, setAbierto] = useState<number | null>(null)
  const [errorAccion, setErrorAccion] = useState('')

  const lista = (datos ?? []).filter((p) =>
    filtro === 'todos' ? true : filtro === 'pendientes' ? p.estado === 'Pagado' || p.estado === 'Preparando' : p.estado === filtro,
  )

  async function cambiar(pedido: Pedido, estado: EstadoPedido) {
    setErrorAccion('')
    try {
      await enviar(`/api/Panel/pedidos/${pedido.id}/estado?estado=${estado}`, 'PUT')
      setDatos((datos ?? []).map((p) => (p.id === pedido.id ? { ...p, estado } : p)))
    } catch (e) {
      setErrorAccion((e as Error).message)
    }
  }

  return (
    <>
      <div className="panel-titulo">
        <div>
          <h1>Pedidos</h1>
          <p>Tocá un pedido para ver los productos y la dirección.</p>
        </div>
      </div>
      <div className="filtros-panel" role="group" aria-label="Filtrar pedidos">
        {FILTROS.map((f) => (
          <button key={f.valor} aria-pressed={filtro === f.valor} onClick={() => setFiltro(f.valor)}>
            {f.nombre} {f.valor === 'pendientes' && `(${(datos ?? []).filter((p) => p.estado === 'Pagado' || p.estado === 'Preparando').length})`}
          </button>
        ))}
      </div>
      {(error || errorAccion) && <p className="mensaje-error" style={{ marginBottom: 16 }}>{error || errorAccion}</p>}
      {cargando ? (
        <div className="cargando"><div className="giro" /></div>
      ) : (
        <div className="tabla-envoltura">
          <table className="tabla">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Entrega</th>
                <th>Estado</th>
                <th className="num">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--texto-2)' }}>No hay pedidos en esta lista.</td></tr>
              )}
              {lista.map((p) => {
                const proximo = siguiente(p)
                return (
                  <Fragment key={p.id}>
                    <tr className="clickeable" onClick={() => setAbierto(abierto === p.id ? null : p.id)} aria-expanded={abierto === p.id}>
                      <td><strong>#{String(p.id).padStart(5, '0')}</strong></td>
                      <td>{fechaCorta(p.fecha)} {hora(p.fecha)}</td>
                      <td>{p.cliente.nombre} {p.cliente.apellido}</td>
                      <td>{p.entrega === 'Envio' ? p.localidad : 'Retira'}</td>
                      <td><span className={`estado ${p.estado}`}>{NOMBRE_ESTADO[p.estado]}</span></td>
                      <td className="num">{precio(p.total)}</td>
                      <td>
                        <div className="acciones-fila" onClick={(e) => e.stopPropagation()}>
                          {proximo && <button className="boton boton-chico" onClick={() => cambiar(p, proximo.estado)}>{proximo.texto}</button>}
                        </div>
                      </td>
                    </tr>
                    {abierto === p.id && (
                      <tr className="detalle-fila">
                        <td colSpan={7}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, padding: '8px 0' }}>
                            <div>
                              <p className="sub" style={{ fontSize: 'var(--t-xs)', color: 'var(--texto-2)' }}>Productos</p>
                              {p.items.map((i) => (
                                <div key={i.productoId} className="celda-producto" style={{ marginTop: 8 }}>
                                  <img className="miniatura" src={i.imagen} alt="" />
                                  <span>{i.cantidad} × {i.nombre}</span>
                                  <span style={{ marginLeft: 'auto' }}>{precio(i.precio * i.cantidad)}</span>
                                </div>
                              ))}
                              <p style={{ marginTop: 10, fontSize: 'var(--t-xs)', color: 'var(--texto-2)' }}>Envío: {p.costoEnvio ? precio(p.costoEnvio) : 'sin costo'}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: 'var(--t-xs)', color: 'var(--texto-2)' }}>Cliente</p>
                              <p>{p.cliente.nombre} {p.cliente.apellido}</p>
                              <p><a href={`mailto:${p.cliente.email}`}>{p.cliente.email}</a></p>
                              <p>{p.cliente.telefono}</p>
                              {p.entrega === 'Envio' && <p style={{ marginTop: 8 }}>{p.direccion}, {p.localidad} ({p.codigoPostal})</p>}
                              {p.estado !== 'Cancelado' && p.estado !== 'Entregado' && (
                                <button className="enlace" style={{ marginTop: 12, color: 'var(--error)' }} onClick={() => cambiar(p, 'Cancelado')}>Cancelar pedido y devolver stock</button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
