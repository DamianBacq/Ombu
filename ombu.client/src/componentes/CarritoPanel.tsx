import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ENVIO_GRATIS_DESDE, useCarrito } from '../carrito'
import { precio } from '../formato'
import { IconoBolsa, IconoCerrar } from './Iconos'

export default function CarritoPanel() {
  const { items, abierto, cerrar, cambiarCantidad, subtotal } = useCarrito()

  useEffect(() => {
    if (!abierto) return
    const alPresionar = (e: KeyboardEvent) => e.key === 'Escape' && cerrar()
    document.addEventListener('keydown', alPresionar)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alPresionar)
      document.body.style.overflow = ''
    }
  }, [abierto, cerrar])

  if (!abierto) return null
  const falta = ENVIO_GRATIS_DESDE - subtotal

  return (
    <>
      <div className="fondo-oscuro" onClick={cerrar} />
      <aside className="panel-lateral" role="dialog" aria-modal="true" aria-label="Carrito">
        <header>
          <h2>Tu carrito</h2>
          <button className="boton-icono" onClick={cerrar} aria-label="Cerrar carrito" autoFocus>
            <IconoCerrar />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cuerpo">
            <div className="vacio">
              <IconoBolsa />
              <p>Todavía no agregaste productos.</p>
              <Link to="/tienda" className="boton" onClick={cerrar}>Ver la tienda</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="cuerpo">
              {items.map(({ producto, cantidad }) => (
                <div className="item-carrito" key={producto.id}>
                  <img src={producto.imagen} alt="" />
                  <div>
                    <h3>{producto.nombre}</h3>
                    <span className="texto-2">{producto.contenido}</span>
                    <div>
                      <div className="cantidad">
                        <button onClick={() => cambiarCantidad(producto.id, cantidad - 1)} aria-label="Quitar uno">−</button>
                        <span>{cantidad}</span>
                        <button onClick={() => cambiarCantidad(producto.id, cantidad + 1)} disabled={cantidad >= producto.stock} aria-label="Agregar uno">+</button>
                      </div>
                    </div>
                  </div>
                  <span className="precio-actual">{precio(producto.precio * cantidad)}</span>
                </div>
              ))}
            </div>
            <footer>
              <div className="barra-envio">
                {falta > 0 ? <>Te faltan <strong>{precio(falta)}</strong> para el envío gratis.</> : <>Tu pedido tiene <strong>envío gratis</strong>.</>}
                <div className="barra"><div style={{ width: `${Math.min(100, (subtotal / ENVIO_GRATIS_DESDE) * 100)}%` }} /></div>
              </div>
              <div className="fila-total grande">
                <span>Subtotal</span>
                <span>{precio(subtotal)}</span>
              </div>
              <Link to="/checkout" className="boton boton-ancho" onClick={cerrar}>Ir a pagar</Link>
              <button className="enlace" onClick={cerrar}>Seguir comprando</button>
            </footer>
          </>
        )}
      </aside>
    </>
  )
}
