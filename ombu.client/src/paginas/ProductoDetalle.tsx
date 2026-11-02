import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TarjetaProducto from '../componentes/TarjetaProducto'
import { useCarrito } from '../carrito'
import { precio } from '../formato'
import { useApi } from '../useApi'
import type { Producto } from '../tipos'
import NoEncontrado from './NoEncontrado'

export default function ProductoDetalle() {
  const { slug } = useParams()
  const { datos: producto, cargando, error } = useApi<Producto>(`/api/Catalogo/productos/${slug}`)
  const todos = useApi<Producto[]>('/api/Catalogo/productos')
  const { agregar } = useCarrito()
  const [cantidad, setCantidad] = useState(1)

  if (cargando) return <div className="cargando"><div className="giro" /></div>
  if (error || !producto) return <NoEncontrado />

  const relacionados = (todos.datos ?? []).filter((p) => p.categoriaId === producto.categoriaId && p.id !== producto.id).slice(0, 4)
  const agotado = producto.stock === 0

  return (
    <div className="contenedor">
      <nav className="migas" aria-label="Ubicación">
        <Link to="/tienda">Tienda</Link> / <span>{producto.categoria}</span>
      </nav>
      <div className="detalle-producto">
        <div className="foto">
          <img src={producto.imagen} alt={producto.nombre} />
        </div>
        <div>
          <h1>{producto.nombre}</h1>
          <p className="texto-2" style={{ marginTop: 10, fontSize: 'var(--t-l)' }}>{producto.resumen}</p>
          <div className="precio-grande">
            {precio(producto.precio)}
            {producto.precioAnterior && <s>{precio(producto.precioAnterior)}</s>}
          </div>
          {agotado ? (
            <p className="aviso-stock">Sin stock por ahora. Escribinos y te avisamos cuando vuelva.</p>
          ) : (
            producto.stock <= 5 && <p className="aviso-stock">Quedan {producto.stock} unidades</p>
          )}

          {!agotado && (
            <div className="comprar">
              <div className="cantidad">
                <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} disabled={cantidad <= 1} aria-label="Quitar uno">−</button>
                <span>{cantidad}</span>
                <button onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))} disabled={cantidad >= producto.stock} aria-label="Agregar uno">+</button>
              </div>
              <button className="boton" style={{ flex: 1 }} onClick={() => agregar(producto, cantidad)}>
                Agregar al carrito · {precio(producto.precio * cantidad)}
              </button>
            </div>
          )}

          <div className="ficha">
            <details open>
              <summary>Qué es</summary>
              <p>{producto.descripcion}</p>
            </details>
            <details>
              <summary>Cómo se usa</summary>
              <p>{producto.modoUso}</p>
            </details>
            <details>
              <summary>Envíos y cambios</summary>
              <p>Enviamos a todo el país en 2 a 5 días hábiles; gratis desde $60.000. También podés retirarlo en el estudio. Si el producto llega dañado, lo cambiamos sin costo.</p>
            </details>
          </div>

          <dl className="propiedades">
            <dt>Contenido</dt>
            <dd>{producto.contenido}</dd>
            <dt>Tipo de piel</dt>
            <dd>{producto.tipoPiel === 'Todas' ? 'Todo tipo de piel' : `Piel ${producto.tipoPiel.toLowerCase()}`}</dd>
          </dl>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section style={{ paddingBottom: 96 }}>
          <h2 style={{ fontSize: 'var(--t-2xl)', marginBottom: 28 }}>De la misma línea</h2>
          <div className="grilla-productos">
            {relacionados.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
