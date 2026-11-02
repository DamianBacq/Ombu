namespace Ombu.Entidades
{
    public class HorarioAtencion
    {
        public int Id { get; set; }
        public int DiaSemana { get; set; }
        public TimeSpan HoraDesde { get; set; }
        public TimeSpan HoraHasta { get; set; }
    }
}
