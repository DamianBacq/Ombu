using Ombu.Datos;
using Ombu.Entidades;

namespace Ombu.Negocio
{
    public class ResumenNegocio
    {
        public Resumen Obtener()
        {
            DateTime ahora = Ajustes.Ahora();
            new PedidoDatos().VencerPendientes(ahora);
            new TurnoDatos().VencerPendientes(ahora);
            return new ResumenDatos().Obtener(ahora);
        }
    }
}
