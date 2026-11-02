using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class PedidoDatos
    {
        private const string Select = @"SELECT pe.id, pe.codigo, pe.estado, pe.entrega, pe.direccion, pe.localidad, pe.codigo_postal,
            pe.subtotal, pe.costo_envio, pe.total, pe.fecha, c.id, c.nombre, c.apellido, c.telefono, c.email
            FROM pedido pe JOIN cliente c ON c.id = pe.cliente_id ";

        // Los pedidos sin pagar a los 30 minutos se cancelan y devuelven el stock
        public void VencerPendientes(DateTime ahora)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(@"WITH vencidos AS (
                    UPDATE pedido SET estado = 'Cancelado' WHERE estado = 'PendientePago' AND fecha < @limite RETURNING id),
                devolver AS (
                    SELECT i.producto_id, sum(i.cantidad) AS cantidad FROM pedido_item i JOIN vencidos v ON v.id = i.pedido_id GROUP BY i.producto_id)
                UPDATE producto p SET stock = p.stock + d.cantidad FROM devolver d WHERE p.id = d.producto_id", conexion);
            comando.Parameters.AddWithValue("limite", ahora.AddMinutes(-30));
            comando.ExecuteNonQuery();
        }

        // Cancela un pedido y devuelve el stock
        public void Cancelar(int id, NpgsqlConnection conexion, NpgsqlTransaction transaccion)
        {
            using NpgsqlCommand comando = new NpgsqlCommand(@"UPDATE producto p SET stock = p.stock + i.cantidad
                FROM pedido_item i WHERE i.pedido_id = @id AND p.id = i.producto_id", conexion, transaccion);
            comando.Parameters.AddWithValue("id", id);
            comando.ExecuteNonQuery();
            CambiarEstado(id, EstadoPedido.Cancelado, conexion, transaccion);
        }

        public int Insertar(Pedido pedido, int clienteId, NpgsqlConnection conexion, NpgsqlTransaction transaccion)
        {
            using NpgsqlCommand comando = new NpgsqlCommand(@"INSERT INTO pedido (cliente_id, codigo, estado, entrega, direccion, localidad, codigo_postal, subtotal, costo_envio, total, fecha)
                VALUES (@cliente, @codigo, @estado, @entrega, @direccion, @localidad, @codigoPostal, @subtotal, @costoEnvio, @total, @fecha) RETURNING id", conexion, transaccion);
            comando.Parameters.AddWithValue("cliente", clienteId);
            comando.Parameters.AddWithValue("codigo", pedido.Codigo);
            comando.Parameters.AddWithValue("estado", pedido.Estado.ToString());
            comando.Parameters.AddWithValue("entrega", pedido.Entrega.ToString());
            comando.Parameters.AddWithValue("direccion", (object)pedido.Direccion ?? DBNull.Value);
            comando.Parameters.AddWithValue("localidad", (object)pedido.Localidad ?? DBNull.Value);
            comando.Parameters.AddWithValue("codigoPostal", (object)pedido.CodigoPostal ?? DBNull.Value);
            comando.Parameters.AddWithValue("subtotal", pedido.Subtotal);
            comando.Parameters.AddWithValue("costoEnvio", pedido.CostoEnvio);
            comando.Parameters.AddWithValue("total", pedido.Total);
            comando.Parameters.AddWithValue("fecha", pedido.Fecha);
            int id = (int)comando.ExecuteScalar();

            foreach (PedidoItem item in pedido.Items)
            {
                using NpgsqlCommand comandoItem = new NpgsqlCommand(@"INSERT INTO pedido_item (pedido_id, producto_id, nombre, precio, cantidad)
                    VALUES (@pedido, @producto, @nombre, @precio, @cantidad)", conexion, transaccion);
                comandoItem.Parameters.AddWithValue("pedido", id);
                comandoItem.Parameters.AddWithValue("producto", item.ProductoId);
                comandoItem.Parameters.AddWithValue("nombre", item.Nombre);
                comandoItem.Parameters.AddWithValue("precio", item.Precio);
                comandoItem.Parameters.AddWithValue("cantidad", item.Cantidad);
                comandoItem.ExecuteNonQuery();
            }
            return id;
        }

        public Pedido ObtenerPorCodigo(Guid codigo)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + "WHERE pe.codigo = @codigo", conexion);
            comando.Parameters.AddWithValue("codigo", codigo);
            Pedido pedido = Leer(comando).FirstOrDefault();
            if (pedido != null) pedido.Items = ListarItems(pedido.Id, conexion);
            return pedido;
        }

        public Pedido ObtenerPorId(int id)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + "WHERE pe.id = @id", conexion);
            comando.Parameters.AddWithValue("id", id);
            Pedido pedido = Leer(comando).FirstOrDefault();
            if (pedido != null) pedido.Items = ListarItems(pedido.Id, conexion);
            return pedido;
        }

        public List<Pedido> Listar()
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + "ORDER BY pe.fecha DESC LIMIT 200", conexion);
            List<Pedido> pedidos = Leer(comando);
            foreach (Pedido pedido in pedidos)
            {
                pedido.Items = ListarItems(pedido.Id, conexion);
            }
            return pedidos;
        }

        public void CambiarEstado(int id, EstadoPedido estado, NpgsqlConnection conexion, NpgsqlTransaction transaccion)
        {
            using NpgsqlCommand comando = new NpgsqlCommand("UPDATE pedido SET estado = @estado WHERE id = @id", conexion, transaccion);
            comando.Parameters.AddWithValue("estado", estado.ToString());
            comando.Parameters.AddWithValue("id", id);
            comando.ExecuteNonQuery();
        }

        private List<PedidoItem> ListarItems(int pedidoId, NpgsqlConnection conexion)
        {
            List<PedidoItem> items = new List<PedidoItem>();
            using NpgsqlCommand comando = new NpgsqlCommand(@"SELECT i.id, i.producto_id, i.nombre, p.imagen, i.precio, i.cantidad
                FROM pedido_item i JOIN producto p ON p.id = i.producto_id WHERE i.pedido_id = @id ORDER BY i.id", conexion);
            comando.Parameters.AddWithValue("id", pedidoId);
            using NpgsqlDataReader lector = comando.ExecuteReader();
            while (lector.Read())
            {
                items.Add(new PedidoItem
                {
                    Id = lector.GetInt32(0),
                    ProductoId = lector.GetInt32(1),
                    Nombre = lector.GetString(2),
                    Imagen = lector.GetString(3),
                    Precio = lector.GetDecimal(4),
                    Cantidad = lector.GetInt32(5)
                });
            }
            return items;
        }

        private List<Pedido> Leer(NpgsqlCommand comando)
        {
            List<Pedido> lista = new List<Pedido>();
            using NpgsqlDataReader lector = comando.ExecuteReader();
            while (lector.Read())
            {
                lista.Add(new Pedido
                {
                    Id = lector.GetInt32(0),
                    Codigo = lector.GetGuid(1),
                    Estado = Enum.Parse<EstadoPedido>(lector.GetString(2)),
                    Entrega = Enum.Parse<TipoEntrega>(lector.GetString(3)),
                    Direccion = lector.IsDBNull(4) ? null : lector.GetString(4),
                    Localidad = lector.IsDBNull(5) ? null : lector.GetString(5),
                    CodigoPostal = lector.IsDBNull(6) ? null : lector.GetString(6),
                    Subtotal = lector.GetDecimal(7),
                    CostoEnvio = lector.GetDecimal(8),
                    Total = lector.GetDecimal(9),
                    Fecha = lector.GetDateTime(10),
                    Cliente = new Cliente { Id = lector.GetInt32(11), Nombre = lector.GetString(12), Apellido = lector.GetString(13), Telefono = lector.GetString(14), Email = lector.GetString(15) }
                });
            }
            return lista;
        }
    }
}
