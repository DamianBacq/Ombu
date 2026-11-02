namespace Ombu.Entidades
{
    public class Turno
    {
        public int Id { get; set; }
        public Cliente Cliente { get; set; }
        public Tratamiento Tratamiento { get; set; }
        public Profesional Profesional { get; set; }
        public DateTime FechaHora { get; set; }
        public decimal Precio { get; set; }
        public decimal Sena { get; set; }
        public EstadoTurno Estado { get; set; }
        public Guid Codigo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public decimal TotalPagado { get; set; }
    }
}
