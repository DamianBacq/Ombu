using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class ProfesionalDatos
    {
        public List<Profesional> Listar()
        {
            List<Profesional> lista = new List<Profesional>();
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("SELECT id, nombre, especialidad, tipo, activo FROM profesional WHERE activo ORDER BY id", conexion);
            using NpgsqlDataReader lector = comando.ExecuteReader();
            while (lector.Read())
            {
                lista.Add(new Profesional { Id = lector.GetInt32(0), Nombre = lector.GetString(1), Especialidad = lector.GetString(2), Tipo = lector.GetString(3), Activo = lector.GetBoolean(4) });
            }
            return lista;
        }
    }
}
