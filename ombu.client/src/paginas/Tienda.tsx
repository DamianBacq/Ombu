import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TarjetaProducto from '../componentes/TarjetaProducto'
import { IconoBuscar } from '../componentes/Iconos'
import { useApi } from '../useApi'
import type { Categoria, Producto } from '../tipos'

const TIPOS_PIEL = ['Todas', 'Seca', 'Grasa', 'Mixta', 'Sensible']

// Saca tildes y mayúsculas para buscar "serum" y encontrar "Sérum"
const normalizar = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function Tienda() {
  const productos = useApi<Producto[]>('/api/Catalogo/productos')
  const categorias = useApi<Categoria[]>('/api/Catalogo/categorias')
  const [params, setParams] = useSearchParams()
  const [busqueda, setBusqueda] = useState('')
  const [piel, setPiel] = useState('Todas')
  const [orden, setOrden] = useState('destacados')

  const categoria = params.get('categoria') ?? ''
  const elegirCategoria = (slug: string) => setParams(slug ? { categoria: slug } : {})
  const nombreCategoria = categorias.datos?.find((c) => c.slug === categoria)?.nombre

  let lista = (productos.datos ?? [])
    .filter((p) => !categoria || categorias.datos?.find((c) => c.slug === categoria)?.id === p.categoriaId)
    .filter((p) => piel === 'Todas' || p.tipoPiel === piel || p.tipoPiel === 'Todas')
    .filter((p) => !busqueda || normalizar(p.nombre + ' ' + p.resumen).includes(normalizar(busqueda)))

  if (orden === 'menor') lista = [...lista].sort((a, b) => a.precio - b.precio)
  if (orden === 'mayor') lista = [...lista].sort((a, b) => b.precio - a.precio)
  if (orden === 'nombre') lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre))

  const cantidadPorCategoria = (id: number) => (productos.datos ?? []).filter((p) => p.categoriaId === id).length

  return (
    <div className="contenedor">
      <header className="titulo-pagina">
        <h1>{nombreCategoria ?? 'Tienda'}</h1>
        <p>Cuidado de la piel elegido por nuestras cosmiatras. Envíos a todo el país o retiro en el estudio.</p>
      </header>

      <div className="tienda">
        <aside className="filtros" aria-label="Filtros">
          <div>
            <h2>Categoría</h2>
            <ul>
              <li><button aria-pressed={!categoria} onClick={() => elegirCategoria('')}>Todo <span>{productos.datos?.length}</span></button></li>
              {(categorias.datos ?? []).map((c) => (
                <li key={c.id}>
                  <button aria-pressed={categoria === c.slug} onClick={() => elegirCategoria(c.slug)}>
                    {c.nombre} <span>{cantidadPorCategoria(c.id)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Tipo de piel</h2>
            <ul>
              {TIPOS_PIEL.map((t) => (
                <li key={t}><button aria-pressed={piel === t} onClick={() => setPiel(t)}>{t === 'Todas' ? 'Cualquiera' : t}</button></li>
              ))}
            </ul>
          </div>
        </aside>

        <div>
          <div className="chips" role="group" aria-label="Categoría">
            <button aria-pressed={!categoria} onClick={() => elegirCategoria('')}>Todo</button>
            {(categorias.datos ?? []).map((c) => (
              <button key={c.id} aria-pressed={categoria === c.slug} onClick={() => elegirCategoria(c.slug)}>{c.nombre}</button>
            ))}
          </div>

          <div className="barra-tienda">
            <label className="buscador">
              <IconoBuscar />
              <input type="search" placeholder="Buscar productos" aria-label="Buscar productos" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </label>
            <select className="selector" value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar">
              <option value="destacados">Destacados primero</option>
              <option value="menor">Menor precio</option>
              <option value="mayor">Mayor precio</option>
              <option value="nombre">Nombre (A a Z)</option>
            </select>
          </div>

          {productos.error && <p className="mensaje-error">{productos.error}</p>}
          <div className="grilla-productos">
            {productos.cargando
              ? [1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="esqueleto" style={{ aspectRatio: '4 / 5.8' }} />)
              : lista.map((p) => <TarjetaProducto key={p.id} producto={p} />)}
          </div>
          {!productos.cargando && lista.length === 0 && (
            <div className="vacio">
              <p>No encontramos productos con esos filtros.</p>
              <button className="boton boton-claro" onClick={() => (setBusqueda(''), setPiel('Todas'), elegirCategoria(''))}>Ver todos los productos</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
