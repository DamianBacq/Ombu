using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class TurnoDatos
    {
        private const string Select = @"SELECT t.id, t.fecha_hora, t.precio, t.sena, t.estado, t.codigo, t.fecha_creacion,
            c.id, c.nombre, c.apellido, c.telefono, c.email,
            tr.id, tr.nombre, tr.duracion_minutos, tr.imagen,
            p.id, p.nombre,
            COALESCE((SELECT sum(monto) FROM pago WHERE turno_id = t.id AND estado = 'Aprobado'), 0), tr.tipo
            FROM turno t
            JOIN cliente c ON c.id = t.cliente_id
            JOIN tratamiento tr ON tr.id = t.tratamiento_id
            JOIN profesional p ON p.id = t.profesional_id ";

        // Los turnos sin pagar a los 15 minutos se cancelan y liberan el horario
        public void VencerPendientes(DateTime ahora)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("UPDATE turno SET estado = 'Cancelado' WHERE estado = 'PendientePago' AND fecha_creacion < @limite", conexion);
            comando.Parameters.AddWithValue("limite", ahora.AddMinutes(-15));
            comando.ExecuteNonQuery();
        }

        // Devuelve los horarios ocupados de un día: profesional y hora
        public List<(int ProfesionalId, DateTime FechaHora)> ListarOcupados(DateTime dia)
        {
            List<(int, DateTime)> lista = new List<(int, DateTime)>();
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(@"SELECT profesional_id, fecha_hora FROM turno
                WHERE estado <> 'Cancelado' AND fecha_hora >= @desde AND fecha_hora < @hasta", conexion);
            comando.Parameters.AddWithValue("desde", dia.Date);
            comando.Parameters.AddWithValue("hasta", dia.Date.AddDays(1));
            using NpgsqlDataReader lector = comando.ExecuteReader();
            while (lector.Read())
            {
                lista.Add((lector.GetInt32(0), lector.GetDateTime(1)));
            }
            return lista;
        }

        public int Insertar(Turno turno, int clienteId, NpgsqlConnection conexion, NpgsqlTransaction transaccion)
        {
            using NpgsqlCommand comando = new NpgsqlCommand(@"INSERT INTO turno (cliente_id, tratamiento_id, profesional_id, fecha_hora, precio, sena, estado, codigo, fecha_creacion)
                VALUES (@cliente, @tratamiento, @profesional, @fechaHora, @precio, @sena, @estado, @codigo, @fechaCreacion) RETURNING id", conexion, transaccion);
            comando.Parameters.AddWithValue("cliente", clienteId);
            comando.Parameters.AddWithValue("tratamiento", turno.Tratamiento.Id);
            comando.Parameters.AddWithValue("profesional", turno.Profesional.Id);
            comando.Parameters.AddWithValue("fechaHora", turno.FechaHora);
            comando.Parameters.AddWithValue("precio", turno.Precio);
            comando.Parameters.AddWithValue("sena", turno.Sena);
            comando.Parameters.AddWithValue("estado", turno.Estado.ToString());
            comando.Parameters.AddWithValue("codigo", turno.Codigo);
            comando.Parameters.AddWithValue("fechaCreacion", turno.FechaCreacion);
            return (int)comando.ExecuteScalar();
        }

        public Turno ObtenerPorCodigo(Guid codigo)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + "WHERE t.codigo = @codigo", conexion);
            comando.Parameters.AddWithValue("codigo", codigo);
            return Leer(comando).FirstOrDefault();
        }

        public Turno ObtenerPorId(int id)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + "WHERE t.id = @id", conexion);
            comando.Parameters.AddWithValue("id", id);
            return Leer(comando).FirstOrDefault();
        }

        public List<Turno> ListarEntre(DateTime desde, DateTime hasta)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + "WHERE t.fecha_hora >= @desde AND t.fecha_hora < @hasta ORDER BY t.fecha_hora, p.id", conexion);
            comando.Parameters.AddWithValue("desde", desde);
            comando.Parameters.AddWithValue("hasta", hasta);
            return Leer(comando);
        }

        public void CambiarEstado(int id, EstadoTurno estado)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("UPDATE turno SET estado = @estado WHERE id = @id", conexion);
            comando.Parameters.AddWithValue("estado", estado.ToString());
            comando.Parameters.AddWithValue("id", id);
            comando.ExecuteNonQuery();
        }

        private List<Turno> Leer(NpgsqlCommand comando)
        {
            List<Turno> lista = new List<Turno>();
            using NpgsqlDataReader lector = comando.ExecuteReader();
            while (lector.Read())
            {
                lista.Add(new Turno
                {
                    Id = lector.GetInt32(0),
                    FechaHora = lector.GetDateTime(1),
                    Precio = lector.GetDecimal(2),
                    Sena = lector.GetDecimal(3),
                    Estado = Enum.Parse<EstadoTurno>(lector.GetString(4)),
                    Codigo = lector.GetGuid(5),
                    FechaCreacion = lector.GetDateTime(6),
                    Cliente = new Cliente { Id = lector.GetInt32(7), Nombre = lector.GetString(8), Apellido = lector.GetString(9), Telefono = lector.GetString(10), Email = lector.GetString(11) },
                    Tratamiento = new Tratamiento { Id = lector.GetInt32(12), Nombre = lector.GetString(13), DuracionMinutos = lector.GetInt32(14), Imagen = lector.GetString(15), Tipo = lector.GetString(19) },
                    Profesional = new Profesional { Id = lector.GetInt32(16), Nombre = lector.GetString(17) },
                    TotalPagado = lector.GetDecimal(18)
                });
            }
            return lista;
        }
    }
}
