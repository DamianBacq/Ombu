using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class PagoDatos
    {
        public int Insertar(Pago pago)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(@"INSERT INTO pago (pedido_id, turno_id, monto, estado, fecha)
                VALUES (@pedido, @turno, @monto, @estado, @fecha) RETURNING id", conexion);
            comando.Parameters.AddWithValue("pedido", (object)pago.PedidoId ?? DBNull.Value);
            comando.Parameters.AddWithValue("turno", (object)pago.TurnoId ?? DBNull.Value);
            comando.Parameters.AddWithValue("monto", pago.Monto);
            comando.Parameters.AddWithValue("estado", pago.Estado.ToString());
            comando.Parameters.AddWithValue("fecha", pago.Fecha);
            return (int)comando.ExecuteScalar();
        }

        public Pago ObtenerPorId(int id)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("SELECT id, pedido_id, turno_id, monto, estado, mp_pago_id, fecha FROM pago WHERE id = @id", conexion);
            comando.Parameters.AddWithValue("id", id);
            using NpgsqlDataReader lector = comando.ExecuteReader();
            if (!lector.Read()) return null;
            return new Pago
            {
                Id = lector.GetInt32(0),
                PedidoId = lector.IsDBNull(1) ? null : lector.GetInt32(1),
                TurnoId = lector.IsDBNull(2) ? null : lector.GetInt32(2),
                Monto = lector.GetDecimal(3),
                Estado = Enum.Parse<EstadoPago>(lector.GetString(4)),
                MpPagoId = lector.IsDBNull(5) ? null : lector.GetString(5),
                Fecha = lector.GetDateTime(6)
            };
        }

        // Solo aprueba si sigue Pendiente: así un pago se procesa una sola vez
        public bool Aprobar(int id, string mpPagoId, NpgsqlConnection conexion, NpgsqlTransaction transaccion)
        {
            using NpgsqlCommand comando = new NpgsqlCommand("UPDATE pago SET estado = 'Aprobado', mp_pago_id = @mp WHERE id = @id AND estado = 'Pendiente'", conexion, transaccion);
            comando.Parameters.AddWithValue("mp", mpPagoId);
            comando.Parameters.AddWithValue("id", id);
            return comando.ExecuteNonQuery() == 1;
        }

        public void Rechazar(int id)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("UPDATE pago SET estado = 'Rechazado' WHERE id = @id AND estado = 'Pendiente'", conexion);
            comando.Parameters.AddWithValue("id", id);
            comando.ExecuteNonQuery();
        }

        // Cobro en el estudio del resto del turno
        public void InsertarAprobado(int turnoId, decimal monto, DateTime fecha)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("INSERT INTO pago (turno_id, monto, estado, fecha) VALUES (@turno, @monto, 'Aprobado', @fecha)", conexion);
            comando.Parameters.AddWithValue("turno", turnoId);
            comando.Parameters.AddWithValue("monto", monto);
            comando.Parameters.AddWithValue("fecha", fecha);
            comando.ExecuteNonQuery();
        }
    }
}
