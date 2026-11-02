using Ombu.Datos;
using Ombu.Entidades;

namespace Ombu.Negocio
{
    public class ConsultaNegocio
    {
        private readonly ConsultaDatos datos = new ConsultaDatos();

        public void Enviar(Consulta consulta)
        {
            if (string.IsNullOrWhiteSpace(consulta.Nombre) || string.IsNullOrWhiteSpace(consulta.Mensaje) || string.IsNullOrWhiteSpace(consulta.Email) || !consulta.Email.Contains('@'))
            {
                throw new Exception("Completá tu nombre, un mail válido y el mensaje.");
            }
            if (consulta.Mensaje.Length > 1000) throw new Exception("El mensaje puede tener hasta 1000 caracteres.");
            consulta.Fecha = Ajustes.Ahora();
            datos.Insertar(consulta);
        }

        public List<Consulta> Listar()
        {
            return datos.Listar();
        }

        public void MarcarLeida(int id)
        {
            datos.MarcarLeida(id);
        }
    }
}
