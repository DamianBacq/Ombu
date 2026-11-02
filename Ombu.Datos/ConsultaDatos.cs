using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class ConsultaDatos
    {
        public void Insertar(Consulta consulta)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("INSERT INTO consulta (nombre, email, mensaje, fecha) VALUES (@nombre, @email, @mensaje, @fecha)", conexion);
            comando.Parameters.AddWithValue("nombre", consulta.Nombre);
            comando.Parameters.AddWithValue("email", consulta.Email);
            comando.Parameters.AddWithValue("mensaje", consulta.Mensaje);
            comando.Parameters.AddWithValue("fecha", consulta.Fecha);
            comando.ExecuteNonQuery();
        }

        public List<Consulta> Listar()
        {
            List<Consulta> lista = new List<Consulta>();
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("SELECT id, nombre, email, mensaje, fecha, leida FROM consulta ORDER BY fecha DESC", conexion);
            using NpgsqlDataReader lector = comando.ExecuteReader();
            while (lector.Read())
            {
                lista.Add(new Consulta
                {
                    Id = lector.GetInt32(0),
                    Nombre = lector.GetString(1),
                    Email = lector.GetString(2),
                    Mensaje = lector.GetString(3),
                    Fecha = lector.GetDateTime(4),
                    Leida = lector.GetBoolean(5)
                });
            }
            return lista;
        }

        public void MarcarLeida(int id)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("UPDATE consulta SET leida = true WHERE id = @id", conexion);
            comando.Parameters.AddWithValue("id", id);
            comando.ExecuteNonQuery();
        }
    }
}
