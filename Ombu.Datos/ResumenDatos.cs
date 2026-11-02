using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class ResumenDatos
    {
        public Resumen Obtener(DateTime ahora)
        {
            Resumen resumen = new Resumen();
            DateTime inicioMes = new DateTime(ahora.Year, ahora.Month, 1);
            DateTime hoy = ahora.Date;
            using NpgsqlConnection conexion = Conexion.Abrir();

            using (NpgsqlCommand comando = new NpgsqlCommand(@"SELECT
                COALESCE((SELECT sum(monto) FROM pago WHERE estado = 'Aprobado' AND fecha >= @inicioMes), 0),
                COALESCE((SELECT sum(monto) FROM pago WHERE estado = 'Aprobado' AND fecha >= @inicioAnterior AND fecha < @inicioMes), 0),
                (SELECT count(*) FROM pedido WHERE estado NOT IN ('PendientePago', 'Cancelado') AND fecha >= @inicioMes),
                COALESCE((SELECT avg(total) FROM pedido WHERE estado NOT IN ('PendientePago', 'Cancelado') AND fecha >= @inicioMes), 0),
                (SELECT count(*) FROM turno WHERE estado IN ('Confirmado', 'Completado') AND fecha_hora >= @hoy AND fecha_hora < @manana),
                (SELECT count(*) FROM turno WHERE estado IN ('Confirmado', 'Completado') AND fecha_hora >= @hoy AND fecha_hora < @semana),
                (SELECT count(*) FROM pedido WHERE estado IN ('Pagado', 'Preparando')),
                (SELECT count(*) FROM consulta WHERE NOT leida)", conexion))
            {
                comando.Parameters.AddWithValue("inicioMes", inicioMes);
                comando.Parameters.AddWithValue("inicioAnterior", inicioMes.AddMonths(-1));
                comando.Parameters.AddWithValue("hoy", hoy);
                comando.Parameters.AddWithValue("manana", hoy.AddDays(1));
                comando.Parameters.AddWithValue("semana", hoy.AddDays(7));
                using NpgsqlDataReader lector = comando.ExecuteReader();
                lector.Read();
                resumen.VentasMes = lector.GetDecimal(0);
                resumen.VentasMesAnterior = lector.GetDecimal(1);
                resumen.PedidosMes = (int)lector.GetInt64(2);
                resumen.TicketPromedio = Math.Round(lector.GetDecimal(3));
                resumen.TurnosHoy = (int)lector.GetInt64(4);
                resumen.TurnosSemana = (int)lector.GetInt64(5);
                resumen.PedidosPorPreparar = (int)lector.GetInt64(6);
                resumen.ConsultasSinLeer = (int)lector.GetInt64(7);
            }

            // Ingresos de los últimos 30 días, separados en tienda y estudio
            using (NpgsqlCommand comando = new NpgsqlCommand(@"SELECT d::date,
                COALESCE((SELECT sum(monto) FROM pago WHERE estado = 'Aprobado' AND pedido_id IS NOT NULL AND fecha::date = d::date), 0),
                COALESCE((SELECT sum(monto) FROM pago WHERE estado = 'Aprobado' AND turno_id IS NOT NULL AND fecha::date = d::date), 0)
                FROM generate_series(@desde, @hoy, interval '1 day') d ORDER BY d", conexion))
            {
                comando.Parameters.AddWithValue("desde", hoy.AddDays(-29));
                comando.Parameters.AddWithValue("hoy", hoy);
                using NpgsqlDataReader lector = comando.ExecuteReader();
                while (lector.Read())
                {
                    resumen.VentasPorDia.Add(new VentaDia { Fecha = lector.GetDateTime(0), Tienda = lector.GetDecimal(1), Estudio = lector.GetDecimal(2) });
                }
            }

            using (NpgsqlCommand comando = new NpgsqlCommand(@"SELECT i.nombre, sum(i.cantidad), sum(i.cantidad * i.precio)
                FROM pedido_item i JOIN pedido p ON p.id = i.pedido_id
                WHERE p.estado NOT IN ('PendientePago', 'Cancelado') AND p.fecha >= @desde
                GROUP BY i.nombre ORDER BY 2 DESC, 3 DESC LIMIT 5", conexion))
            {
                comando.Parameters.AddWithValue("desde", hoy.AddDays(-29));
                using NpgsqlDataReader lector = comando.ExecuteReader();
                while (lector.Read())
                {
                    resumen.MasVendidos.Add(new ProductoVendido { Nombre = lector.GetString(0), Unidades = (int)lector.GetInt64(1), Total = lector.GetDecimal(2) });
                }
            }

            using (NpgsqlCommand comando = new NpgsqlCommand("SELECT id, nombre, stock, imagen FROM producto WHERE activo AND stock <= 5 ORDER BY stock", conexion))
            {
                using NpgsqlDataReader lector = comando.ExecuteReader();
                while (lector.Read())
                {
                    resumen.StockBajo.Add(new Producto { Id = lector.GetInt32(0), Nombre = lector.GetString(1), Stock = lector.GetInt32(2), Imagen = lector.GetString(3) });
                }
            }

            return resumen;
        }
    }
}
