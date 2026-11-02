using Ombu.Datos;
using Ombu.Entidades;

namespace Ombu.Negocio
{
    public class TratamientoNegocio
    {
        private readonly TratamientoDatos datos = new TratamientoDatos();

        public List<Tratamiento> Listar(bool soloActivos)
        {
            return datos.Listar(soloActivos);
        }

        public Tratamiento ObtenerPorSlug(string slug)
        {
            return datos.ObtenerPorSlug(slug);
        }

        public void Modificar(Tratamiento tratamiento)
        {
            if (string.IsNullOrWhiteSpace(tratamiento.Nombre)) throw new Exception("El tratamiento necesita un nombre.");
            if (tratamiento.Precio <= 0) throw new Exception("El precio tiene que ser mayor a cero.");
            if (tratamiento.DuracionMinutos <= 0 || tratamiento.DuracionMinutos > 60) throw new Exception("La duración tiene que estar entre 1 y 60 minutos.");
            datos.Modificar(tratamiento);
        }
    }
}
