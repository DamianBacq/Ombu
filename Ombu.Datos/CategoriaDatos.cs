using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class CategoriaDatos
    {
        public List<Categoria> Listar()
        {
            List<Categoria> lista = new List<Categoria>();
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("SELECT id, nombre, slug FROM categoria ORDER BY id", conexion);
            using NpgsqlDataReader lector = comando.ExecuteReader();
            while (lector.Read())
            {
                lista.Add(new Categoria { Id = lector.GetInt32(0), Nombre = lector.GetString(1), Slug = lector.GetString(2) });
            }
            return lista;
        }
    }
}
