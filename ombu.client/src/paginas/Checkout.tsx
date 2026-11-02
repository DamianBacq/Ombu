import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { enviar } from '../api'
import { ENVIO, ENVIO_GRATIS_DESDE, useCarrito } from '../carrito'
import { precio } from '../formato'
import type { Pedido } from '../tipos'

export default function Checkout() {
  const { items, subtotal, vaciar } = useCarrito()
  const [cliente, setCliente] = useState({ nombre: '', apellido: '', telefono: '', email: '' })
  const [entrega, setEntrega] = useState<'Envio' | 'Retiro'>('Envio')
  const [direccion, setDireccion] = useState({ direccion: '', localidad: '', codigoPostal: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const costoEnvio = entrega === 'Envio' && subtotal < ENVIO_GRATIS_DESDE ? ENVIO : 0
  const total = subtotal + costoEnvio

  async function pagar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const pedido = await enviar<Pedido>('/api/Pedidos', 'POST', {
        cliente,
        entrega,
        ...(entrega === 'Envio' ? direccion : {}),
        items: items.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
      })
      const pago = await enviar<{ url: string }>(`/api/Pagos/pedido/${pedido.codigo}`, 'POST')
      vaciar()
      window.location.href = pago.url
    } catch (err) {
      setError((err as Error).message)
      setEnviando(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="tarjeta-estado">
        <h1>Tu carrito está vacío</h1>
        <p className="texto-2">Agregá productos desde la tienda para hacer tu pedido.</p>
        <div><Link to="/tienda" className="boton">Ver la tienda</Link></div>
      </div>
    )
  }

  return (
    <div className="contenedor">
      <header className="titulo-pagina">
        <h1>Finalizar compra</h1>
      </header>
      <form className="checkout" onSubmit={pagar}>
        <div>
          <fieldset>
            <h2>Tus datos</h2>
            <div className="formulario">
              <div className="campos-2">
                <div className="campo">
                  <label htmlFor="k-nombre">Nombre</label>
                  <input id="k-nombre" required autoComplete="given-name" value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} />
                </div>
                <div className="campo">
                  <label htmlFor="k-apellido">Apellido</label>
                  <input id="k-apellido" required autoComplete="family-name" value={cliente.apellido} onChange={(e) => setCliente({ ...cliente, apellido: e.target.value })} />
                </div>
              </div>
              <div className="campos-2">
                <div className="campo">
                  <label htmlFor="k-email">Mail</label>
                  <input id="k-email" type="email" required autoComplete="email" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} />
                </div>
                <div className="campo">
                  <label htmlFor="k-telefono">Teléfono</label>
                  <input id="k-telefono" type="tel" required autoComplete="tel" value={cliente.telefono} onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })} />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <h2>Entrega</h2>
            <div className="opciones">
              <label className="opcion">
                <input type="radio" name="entrega" checked={entrega === 'Envio'} onChange={() => setEntrega('Envio')} />
                <div><strong>Envío a domicilio</strong><span>Llega en 2 a 5 días hábiles</span></div>
                <span className="derecha">{subtotal >= ENVIO_GRATIS_DESDE ? 'Gratis' : precio(ENVIO)}</span>
              </label>
              <label className="opcion">
                <input type="radio" name="entrega" checked={entrega === 'Retiro'} onChange={() => setEntrega('Retiro')} />
                <div><strong>Retiro en el estudio</strong><span>Calle Ejemplo 1234, Lomas de Zamora. Listo en 24 horas</span></div>
                <span className="derecha">Gratis</span>
              </label>
            </div>
            {entrega === 'Envio' && (
              <div className="formulario" style={{ marginTop: 20 }}>
                <div className="campo">
                  <label htmlFor="k-direccion">Calle y número</label>
                  <input id="k-direccion" required autoComplete="street-address" value={direccion.direccion} onChange={(e) => setDireccion({ ...direccion, direccion: e.target.value })} />
                </div>
                <div className="campos-2">
                  <div className="campo">
                    <label htmlFor="k-localidad">Localidad</label>
                    <input id="k-localidad" required autoComplete="address-level2" value={direccion.localidad} onChange={(e) => setDireccion({ ...direccion, localidad: e.target.value })} />
                  </div>
                  <div className="campo">
                    <label htmlFor="k-cp">Código postal</label>
                    <input id="k-cp" required inputMode="numeric" autoComplete="postal-code" value={direccion.codigoPostal} onChange={(e) => setDireccion({ ...direccion, codigoPostal: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
          </fieldset>
        </div>

        <aside className="resumen-lateral" aria-label="Resumen del pedido">
          <div className="cuerpo">
            <h3>Tu pedido</h3>
            <div>
              {items.map(({ producto, cantidad }) => (
                <div className="item-carrito" key={producto.id}>
                  <img src={producto.imagen} alt="" />
                  <div>
                    <h3>{producto.nombre}</h3>
                    <span className="texto-2">{cantidad} × {precio(producto.precio)}</span>
                  </div>
                  <span className="precio-actual">{precio(producto.precio * cantidad)}</span>
                </div>
              ))}
            </div>
            <dl>
              <div><dt>Subtotal</dt><dd>{precio(subtotal)}</dd></div>
              <div><dt>Envío</dt><dd>{costoEnvio ? precio(costoEnvio) : 'Gratis'}</dd></div>
              <div className="total"><dt>Total</dt><dd style={{ fontSize: 'var(--t-l)' }}>{precio(total)}</dd></div>
            </dl>
            {error && <p className="mensaje-error">{error}</p>}
            <button className="boton boton-ancho" disabled={enviando}>{enviando ? 'Preparando el pago…' : `Pagar ${precio(total)}`}</button>
            <p className="texto-2" style={{ fontSize: 'var(--t-xs)', textAlign: 'center' }}>Pagás con Mercado Pago: tarjeta, débito o dinero en cuenta.</p>
          </div>
        </aside>
      </form>
    </div>
  )
}
