using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class UsuarioDatos
    {
        public Usuario ObtenerPorNombre(string nombreUsuario)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("SELECT id, usuario, password_hash FROM usuario WHERE usuario = @usuario", conexion);
            comando.Parameters.AddWithValue("usuario", nombreUsuario);
            using NpgsqlDataReader lector = comando.ExecuteReader();
            if (!lector.Read()) return null;
            return new Usuario { Id = lector.GetInt32(0), NombreUsuario = lector.GetString(1), PasswordHash = lector.GetString(2) };
        }

        public int Contar()
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("SELECT count(*) FROM usuario", conexion);
            return Convert.ToInt32(comando.ExecuteScalar());
        }

        public void Insertar(Usuario usuario)
        {
            using NpgsqlConnection conexion = Conexion.Abrir();
            using NpgsqlCommand comando = new NpgsqlCommand("INSERT INTO usuario (usuario, password_hash) VALUES (@usuario, @hash)", conexion);
            comando.Parameters.AddWithValue("usuario", usuario.NombreUsuario);
            comando.Parameters.AddWithValue("hash", usuario.PasswordHash);
            comando.ExecuteNonQuery();
        }
    }
}
