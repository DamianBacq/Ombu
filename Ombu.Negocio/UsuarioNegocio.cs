using Ombu.Datos;
using Ombu.Entidades;

namespace Ombu.Negocio
{
    public class UsuarioNegocio
    {
        private readonly UsuarioDatos datos = new UsuarioDatos();

        // Al arrancar: si no hay usuarios, crea el inicial
        public void CrearInicial(string usuario, string password)
        {
            if (datos.Contar() > 0) return;
            datos.Insertar(new Usuario { NombreUsuario = usuario, PasswordHash = BCrypt.Net.BCrypt.HashPassword(password) });
        }

        public bool Validar(string usuario, string password)
        {
            Usuario encontrado = datos.ObtenerPorNombre(usuario ?? "");
            return encontrado != null && BCrypt.Net.BCrypt.Verify(password ?? "", encontrado.PasswordHash);
        }
    }
}
