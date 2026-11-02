using Npgsql;
using Ombu.Datos;
using Ombu.Entidades;

namespace Ombu.Negocio
{
    public class PedidoNegocio
    {
        public const decimal CostoEnvio = 4500;
        public const decimal EnvioGratisDesde = 60000;

        private readonly PedidoDatos pedidoDatos = new PedidoDatos();
        private readonly ProductoDatos productoDatos = new ProductoDatos();
        private readonly ClienteDatos clienteDatos = new ClienteDatos();

        // Recibe el pedido con el cliente, la entrega y los items (id de producto y cantidad).
        // Los precios se toman siempre de la base, nunca del navegador.
        public Pedido Crear(Pedido pedido)
        {
            if (pedido.Cliente == null || string.IsNullOrWhiteSpace(pedido.Cliente.Nombre) || string.IsNullOrWhiteSpace(pedido.Cliente.Apellido)
                || string.IsNullOrWhiteSpace(pedido.Cliente.Telefono) || string.IsNullOrWhiteSpace(pedido.Cliente.Email) || !pedido.Cliente.Email.Contains('@'))
            {
                throw new Exception("Completá nombre, apellido, teléfono y un mail válido.");
            }
            if (pedido.Entrega == TipoEntrega.Envio && (string.IsNullOrWhiteSpace(pedido.Direccion) || string.IsNullOrWhiteSpace(pedido.Localidad) || string.IsNullOrWhiteSpace(pedido.CodigoPostal)))
            {
                throw new Exception("Para el envío necesitamos dirección, localidad y código postal.");
            }
            if (pedido.Entrega == TipoEntrega.Retiro)
            {
                pedido.Direccion = null;
                pedido.Localidad = null;
                pedido.CodigoPostal = null;
            }

            // Junta los items repetidos del mismo producto
            List<PedidoItem> items = pedido.Items
                .Where(i => i.Cantidad > 0)
                .GroupBy(i => i.ProductoId)
                .Select(g => new PedidoItem { ProductoId = g.Key, Cantidad = g.Sum(i => i.Cantidad) })
                .ToList();
            if (items.Count == 0) throw new Exception("El carrito está vacío.");

            foreach (PedidoItem item in items)
            {
                Producto producto = productoDatos.ObtenerPorId(item.ProductoId);
                if (producto == null || !producto.Activo) throw new Exception("Uno de los productos ya no está disponible.");
                item.Nombre = producto.Nombre;
                item.Precio = producto.Precio;
            }

            DateTime ahora = Ajustes.Ahora();
            pedidoDatos.VencerPendientes(ahora);

            pedido.Items = items;
            pedido.Subtotal = items.Sum(i => i.Precio * i.Cantidad);
            pedido.CostoEnvio = pedido.Entrega == TipoEntrega.Envio && pedido.Subtotal < EnvioGratisDesde ? CostoEnvio : 0;
            pedido.Total = pedido.Subtotal + pedido.CostoEnvio;
            pedido.Estado = EstadoPedido.PendientePago;
            pedido.Codigo = Guid.NewGuid();
            pedido.Fecha = ahora;

            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlTransaction transaccion = conexion.BeginTransaction();
            foreach (PedidoItem item in items)
            {
                if (!productoDatos.DescontarStock(item.ProductoId, item.Cantidad, conexion, transaccion))
                {
                    transaccion.Rollback();
                    throw new Exception("No hay stock suficiente de " + item.Nombre + ".");
                }
            }
            int clienteId = clienteDatos.Guardar(pedido.Cliente, conexion, transaccion);
            pedido.Id = pedidoDatos.Insertar(pedido, clienteId, conexion, transaccion);
            transaccion.Commit();
            return pedido;
        }

        public Pedido ObtenerPorCodigo(Guid codigo)
        {
            pedidoDatos.VencerPendientes(Ajustes.Ahora());
            return pedidoDatos.ObtenerPorCodigo(codigo);
        }

        public List<Pedido> Listar()
        {
            pedidoDatos.VencerPendientes(Ajustes.Ahora());
            return pedidoDatos.Listar();
        }

        // Avanza el pedido en el panel: Pagado -> Preparando -> Enviado -> Entregado, o lo cancela
        public void CambiarEstado(int id, EstadoPedido estado)
        {
            Pedido pedido = pedidoDatos.ObtenerPorId(id);
            if (pedido == null) throw new Exception("No encontramos ese pedido.");
            if (pedido.Estado == EstadoPedido.Cancelado || pedido.Estado == EstadoPedido.Entregado) throw new Exception("Ese pedido ya está cerrado.");
            if (estado == EstadoPedido.Enviado && pedido.Entrega == TipoEntrega.Retiro) throw new Exception("Este pedido se retira en el estudio: pasalo a Entregado.");

            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlTransaction transaccion = conexion.BeginTransaction();
            if (estado == EstadoPedido.Cancelado) pedidoDatos.Cancelar(id, conexion, transaccion);
            else pedidoDatos.CambiarEstado(id, estado, conexion, transaccion);
            transaccion.Commit();
        }
    }
}
