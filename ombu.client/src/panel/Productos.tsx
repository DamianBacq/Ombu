import { useState, type FormEvent } from 'react'
import { api, enviar } from '../api'
import { IconoCerrar } from '../componentes/Iconos'
import { precio } from '../formato'
import { useApi } from '../useApi'
import type { Categoria, Producto } from '../tipos'

const VACIO: Partial<Producto> = {
  id: 0, categoriaId: 1, nombre: '', resumen: '', descripcion: '', modoUso: '', tipoPiel: 'Todas', contenido: '',
  precio: 0, precioAnterior: null, stock: 0, imagen: '', destacado: false, activo: true,
}

export default function Productos() {
  const { datos, cargando, setDatos } = useApi<Producto[]>('/api/Panel/productos')
  const categorias = useApi<Categoria[]>('/api/Catalogo/categorias')
  const [editando, setEditando] = useState<Partial<Producto> | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const lista = (datos ?? []).filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  const cambiar = (campo: keyof Producto, valor: unknown) => setEditando({ ...editando, [campo]: valor })

  async function guardar(e: FormEvent) {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      await enviar('/api/Panel/productos', 'POST', editando)
      setDatos(await api<Producto[]>('/api/Panel/productos'))
      setEditando(null)
    } catch (err) {
      setError((err as Error).message)
    }
    setGuardando(false)
  }

  return (
    <>
      <div className="panel-titulo">
        <div>
          <h1>Productos</h1>
          <p>{datos?.filter((p) => p.activo).length ?? 0} a la venta. Los que están pausados no se ven en la tienda.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="selector" placeholder="Buscar" aria-label="Buscar productos" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <button className="boton boton-chico" onClick={() => (setError(''), setEditando({ ...VACIO }))}>Nuevo producto</button>
        </div>
      </div>

      {cargando ? (
        <div className="cargando"><div className="giro" /></div>
      ) : (
        <div className="tabla-envoltura">
          <table className="tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th className="num">Precio</th>
                <th className="num">Stock</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p) => (
                <tr key={p.id} className={`clickeable ${p.activo ? '' : 'apagado'}`} onClick={() => (setError(''), setEditando(p))}>
                  <td>
                    <div className="celda-producto">
                      <img className="miniatura" src={p.imagen} alt="" />
                      <div>
                        <strong>{p.nombre}</strong>
                        {p.destacado && <div style={{ fontSize: 12, color: 'var(--orquidea)' }}>Destacado en el inicio</div>}
                      </div>
                    </div>
                  </td>
                  <td>{p.categoria}</td>
                  <td className="num">
                    {precio(p.precio)}
                    {p.precioAnterior && <div style={{ fontSize: 12, color: 'var(--texto-2)', textDecoration: 'line-through' }}>{precio(p.precioAnterior)}</div>}
                  </td>
                  <td className="num" style={{ color: p.stock === 0 ? 'var(--error)' : p.stock <= 5 ? '#7A5A12' : undefined, fontWeight: p.stock <= 5 ? 600 : undefined }}>{p.stock}</td>
                  <td><span className={`estado ${p.activo ? 'Confirmado' : 'Cancelado'}`}>{p.activo ? 'A la venta' : 'Pausado'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editando && (
        <>
          <div className="fondo-oscuro" onClick={() => setEditando(null)} />
          <aside className="panel-lateral ancho" role="dialog" aria-modal="true" aria-label="Editar producto">
            <header>
              <h2>{editando.id ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button className="boton-icono" onClick={() => setEditando(null)} aria-label="Cerrar"><IconoCerrar /></button>
            </header>
            <form className="cuerpo" onSubmit={guardar} id="form-producto">
              <div className="formulario">
                {editando.imagen && <img src={editando.imagen} alt="" style={{ width: 96, aspectRatio: '4/5', objectFit: 'cover', borderRadius: '48px 48px 10px 10px' }} />}
                <div className="campo">
                  <label htmlFor="p-nombre">Nombre</label>
                  <input id="p-nombre" required value={editando.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />
                </div>
                <div className="campos-2">
                  <div className="campo">
                    <label htmlFor="p-categoria">Categoría</label>
                    <select id="p-categoria" value={editando.categoriaId} onChange={(e) => cambiar('categoriaId', Number(e.target.value))}>
                      {(categorias.datos ?? []).map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="campo">
                    <label htmlFor="p-piel">Tipo de piel</label>
                    <select id="p-piel" value={editando.tipoPiel} onChange={(e) => cambiar('tipoPiel', e.target.value)}>
                      {['Todas', 'Seca', 'Grasa', 'Mixta', 'Sensible'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="campos-2">
                  <div className="campo">
                    <label htmlFor="p-precio">Precio</label>
                    <input id="p-precio" type="number" min={1} required value={editando.precio || ''} onChange={(e) => cambiar('precio', Number(e.target.value))} />
                  </div>
                  <div className="campo">
                    <label htmlFor="p-anterior">Precio anterior (para mostrar oferta)</label>
                    <input id="p-anterior" type="number" min={0} value={editando.precioAnterior ?? ''} onChange={(e) => cambiar('precioAnterior', e.target.value ? Number(e.target.value) : null)} />
                  </div>
                </div>
                <div className="campos-2">
                  <div className="campo">
                    <label htmlFor="p-stock">Stock</label>
                    <input id="p-stock" type="number" min={0} required value={editando.stock} onChange={(e) => cambiar('stock', Number(e.target.value))} />
                  </div>
                  <div className="campo">
                    <label htmlFor="p-contenido">Contenido</label>
                    <input id="p-contenido" placeholder="30 ml" value={editando.contenido} onChange={(e) => cambiar('contenido', e.target.value)} />
                  </div>
                </div>
                <div className="campo">
                  <label htmlFor="p-resumen">Resumen (una línea)</label>
                  <input id="p-resumen" value={editando.resumen} onChange={(e) => cambiar('resumen', e.target.value)} />
                </div>
                <div className="campo">
                  <label htmlFor="p-descripcion">Descripción</label>
                  <textarea id="p-descripcion" value={editando.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} />
                </div>
                <div className="campo">
                  <label htmlFor="p-uso">Modo de uso</label>
                  <textarea id="p-uso" value={editando.modoUso} onChange={(e) => cambiar('modoUso', e.target.value)} />
                </div>
                <div className="campo">
                  <label htmlFor="p-imagen">Imagen (ruta en /img)</label>
                  <input id="p-imagen" placeholder="/img/p-nuevo.jpg" value={editando.imagen} onChange={(e) => cambiar('imagen', e.target.value)} />
                </div>
                <label className="interruptor"><input type="checkbox" checked={!!editando.destacado} onChange={(e) => cambiar('destacado', e.target.checked)} /> Destacar en el inicio</label>
                <label className="interruptor"><input type="checkbox" checked={!!editando.activo} onChange={(e) => cambiar('activo', e.target.checked)} /> A la venta</label>
                {error && <p className="mensaje-error">{error}</p>}
              </div>
            </form>
            <footer>
              <button className="boton boton-ancho" form="form-producto" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar producto'}</button>
            </footer>
          </aside>
        </>
      )}
    </>
  )
}
