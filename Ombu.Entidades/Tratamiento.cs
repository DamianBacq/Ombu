namespace Ombu.Entidades
{
    public class Tratamiento
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Slug { get; set; }
        public string Tipo { get; set; }
        public string Resumen { get; set; }
        public string Descripcion { get; set; }
        public int DuracionMinutos { get; set; }
        public decimal Precio { get; set; }
        public string Imagen { get; set; }
        public bool Activo { get; set; }
    }
}
