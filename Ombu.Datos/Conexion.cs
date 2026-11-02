using Npgsql;

namespace Ombu.Datos
{
    public static class Conexion
    {
        // Se carga en Program.cs desde ConnectionStrings:Ombu
        public static string Cadena { get; set; }

        public static NpgsqlConnection Abrir()
        {
            NpgsqlConnection conexion = new NpgsqlConnection(Cadena);
            conexion.Open();
            return conexion;
        }
    }
}
