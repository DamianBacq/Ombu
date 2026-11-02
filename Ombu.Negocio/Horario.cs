namespace Ombu.Negocio
{
    // Un horario libre del día con los profesionales que lo tienen disponible
    public class Horario
    {
        public string Hora { get; set; }
        public List<int> Profesionales { get; set; } = new List<int>();
    }
}
