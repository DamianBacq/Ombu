using Npgsql;
using Ombu.Entidades;

namespace Ombu.Datos
{
    public class ClienteDatos
    {
        // Si el mail ya existe, actualiza los datos y devuelve el mismo id
        public int Guardar(Cliente cliente, NpgsqlConnection conexion, NpgsqlTransaction transaccion)
        {
            using NpgsqlCommand comando = new NpgsqlCommand(@"INSERT INTO cliente (nombre, apellido, telefono, email)
                VALUES (@nombre, @apellido, @telefono, @email)
                ON CONFLICT (email) DO UPDATE SET nombre = @nombre, apellido = @apellido, telefono = @telefono
                RETURNING id", conexion, transaccion);
            comando.Parameters.AddWithValue("nombre", cliente.Nombre);
            comando.Parameters.AddWithValue("apellido", cliente.Apellido);
            comando.Parameters.AddWithValue("telefono", cliente.Telefono);
            comando.Parameters.AddWithValue("email", cliente.Email.ToLower());
            return (int)comando.ExecuteScalar();
        }
    }
}
