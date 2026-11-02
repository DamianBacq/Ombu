import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Producto } from './tipos'

export interface ItemCarrito {
  producto: Producto
  cantidad: number
}

interface ContextoCarrito {
  items: ItemCarrito[]
  abierto: boolean
  abrir: () => void
  cerrar: () => void
  agregar: (producto: Producto, cantidad?: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  cantidadTotal: number
  subtotal: number
}

const Contexto = createContext<ContextoCarrito | null>(null)

function leerGuardado(): ItemCarrito[] {
  try {
    return JSON.parse(localStorage.getItem('ombu-carrito') || '[]')
  } catch {
    return []
  }
}

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>(leerGuardado)
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('ombu-carrito', JSON.stringify(items))
    } catch {
      // el carrito queda solo en memoria
    }
  }, [items])

  function agregar(producto: Producto, cantidad = 1) {
    setItems((actuales) => {
      const existente = actuales.find((i) => i.producto.id === producto.id)
      if (existente) {
        return actuales.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: Math.min(i.cantidad + cantidad, producto.stock) } : i,
        )
      }
      return [...actuales, { producto, cantidad: Math.min(cantidad, producto.stock) }]
    })
    setAbierto(true)
  }

  function cambiarCantidad(productoId: number, cantidad: number) {
    setItems((actuales) =>
      cantidad <= 0
        ? actuales.filter((i) => i.producto.id !== productoId)
        : actuales.map((i) => (i.producto.id === productoId ? { ...i, cantidad: Math.min(cantidad, i.producto.stock) } : i)),
    )
  }

  return (
    <Contexto.Provider
      value={{
        items,
        abierto,
        abrir: () => setAbierto(true),
        cerrar: () => setAbierto(false),
        agregar,
        cambiarCantidad,
        vaciar: () => setItems([]),
        cantidadTotal: items.reduce((s, i) => s + i.cantidad, 0),
        subtotal: items.reduce((s, i) => s + i.cantidad * i.producto.precio, 0),
      }}
    >
      {children}
    </Contexto.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarrito() {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error('useCarrito tiene que usarse dentro de CarritoProvider')
  return contexto
}

export const ENVIO = 4500
export const ENVIO_GRATIS_DESDE = 60000
