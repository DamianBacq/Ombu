import { Link } from 'react-router-dom'
import { useCarrito } from '../carrito'
import { precio } from '../formato'
import type { Producto } from '../tipos'
import { IconoMas } from './Iconos'

export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito()
  const agotado = producto.stock === 0

  return (
    <article className="tarjeta-producto">
      <div className="foto">
        {agotado && <span className="etiqueta agotado">Sin stock</span>}
        {!agotado && producto.precioAnterior && (
          <span className="etiqueta">{Math.round((1 - producto.precio / producto.precioAnterior) * 100)}% menos</span>
        )}
        <img src={producto.imagen} alt="" loading="lazy" />
        {!agotado && (
          <button className="agregar-rapido" onClick={() => agregar(producto)} aria-label={`Agregar ${producto.nombre} al carrito`}>
            <IconoMas />
          </button>
        )}
      </div>
      <div className="info">
        <h3>
          <Link to={`/tienda/${producto.slug}`}>{producto.nombre}</Link>
        </h3>
        <span className="detalle">{producto.contenido} · {producto.categoria}</span>
        <div className="precios">
          <span className="precio-actual">{precio(producto.precio)}</span>
          {producto.precioAnterior && <span className="precio-anterior">{precio(producto.precioAnterior)}</span>}
        </div>
      </div>
    </article>
  )
}
