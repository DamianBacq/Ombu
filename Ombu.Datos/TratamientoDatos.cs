using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class TratamientoDatos
    {
        private const string Select = "SELECT id, nombre, slug, tipo, resumen, descripcion, duracion_minutos, precio, imagen, activo FROM tratamiento ";

        public List<Tratamiento> Listar(bool soloActivos)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + (soloActivos ? "WHERE activo " : "") + "ORDER BY id", conexion);
            return Leer(comando);
        }

        public Tratamiento ObtenerPorId(int id)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + "WHERE id = @id", conexion);
            comando.Parameters.AddWithValue("id", id);
            return Leer(comando).FirstOrDefault();
        }

        public Tratamiento ObtenerPorSlug(string slug)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(Select + "WHERE slug = @slug AND activo", conexion);
            comando.Parameters.AddWithValue("slug", slug);
            return Leer(comando).FirstOrDefault();
        }

        public void Modificar(Tratamiento tratamiento)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand(@"UPDATE tratamiento SET nombre = @nombre, resumen = @resumen, descripcion = @descripcion,
                duracion_minutos = @duracion, precio = @precio, activo = @activo WHERE id = @id", conexion);
            comando.Parameters.AddWithValue("nombre", tratamiento.Nombre);
            comando.Parameters.AddWithValue("resumen", tratamiento.Resumen);
            comando.Parameters.AddWithValue("descripcion", tratamiento.Descripcion);
            comando.Parameters.AddWithValue("duracion", tratamiento.DuracionMinutos);
            comando.Parameters.AddWithValue("precio", tratamiento.Precio);
            comando.Parameters.AddWithValue("activo", tratamiento.Activo);
            comando.Parameters.AddWithValue("id", tratamiento.Id);
            comando.ExecuteNonQuery();
        }

        private List<Tratamiento> Leer(NpgsqlCommand comando)
        {
            List<Tratamiento> lista = new List<Tratamiento>();
            using NpgsqlDataReader lector = comando.ExecuteReader();
            while (lector.Read())
            {
                lista.Add(new Tratamiento
                {
                    Id = lector.GetInt32(0),
                    Nombre = lector.GetString(1),
                    Slug = lector.GetString(2),
                    Tipo = lector.GetString(3),
                    Resumen = lector.GetString(4),
                    Descripcion = lector.GetString(5),
                    DuracionMinutos = lector.GetInt32(6),
                    Precio = lector.GetDecimal(7),
                    Imagen = lector.GetString(8),
                    Activo = lector.GetBoolean(9)
                });
            }
            return lista;
        }
    }
}
