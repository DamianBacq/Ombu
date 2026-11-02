export interface Categoria {
  id: number
  nombre: string
  slug: string
}

export interface Producto {
  id: number
  categoriaId: number
  categoria: string
  nombre: string
  slug: string
  resumen: string
  descripcion: string
  modoUso: string
  tipoPiel: string
  contenido: string
  precio: number
  precioAnterior: number | null
  stock: number
  imagen: string
  destacado: boolean
  activo: boolean
}

export interface Tratamiento {
  id: number
  nombre: string
  slug: string
  tipo: 'Facial' | 'Corporal'
  resumen: string
  descripcion: string
  duracionMinutos: number
  precio: number
  imagen: string
  activo: boolean
}

export interface Profesional {
  id: number
  nombre: string
  especialidad: string
  tipo: string
}

export interface HorarioAtencion {
  diaSemana: number
  horaDesde: string
  horaHasta: string
}

export interface Cliente {
  nombre: string
  apellido: string
  telefono: string
  email: string
}

export interface Turno {
  id: number
  cliente: Cliente
  tratamiento: Tratamiento
  profesional: Profesional
  fechaHora: string
  precio: number
  sena: number
  estado: 'PendientePago' | 'Confirmado' | 'Cancelado' | 'Completado' | 'Ausente'
  codigo: string
  totalPagado: number
}

export interface PedidoItem {
  productoId: number
  nombre: string
  imagen: string
  precio: number
  cantidad: number
}

export type EstadoPedido = 'PendientePago' | 'Pagado' | 'Preparando' | 'Enviado' | 'Entregado' | 'Cancelado'

export interface Pedido {
  id: number
  cliente: Cliente
  codigo: string
  estado: EstadoPedido
  entrega: 'Retiro' | 'Envio'
  direccion: string | null
  localidad: string | null
  codigoPostal: string | null
  subtotal: number
  costoEnvio: number
  total: number
  fecha: string
  items: PedidoItem[]
}

export interface Consulta {
  id: number
  nombre: string
  email: string
  mensaje: string
  fecha: string
  leida: boolean
}

export interface Resumen {
  ventasMes: number
  ventasMesAnterior: number
  pedidosMes: number
  ticketPromedio: number
  turnosHoy: number
  turnosSemana: number
  pedidosPorPreparar: number
  consultasSinLeer: number
  ventasPorDia: { fecha: string; tienda: number; estudio: number }[]
  masVendidos: { nombre: string; unidades: number; total: number }[]
  stockBajo: Producto[]
}
