namespace Ombu.Entidades
{
    public class Producto
    {
        public int Id { get; set; }
        public int CategoriaId { get; set; }
        public string Categoria { get; set; }
        public string Nombre { get; set; }
        public string Slug { get; set; }
        public string Resumen { get; set; }
        public string Descripcion { get; set; }
        public string ModoUso { get; set; }
        public string TipoPiel { get; set; }
        public string Contenido { get; set; }
        public decimal Precio { get; set; }
        public decimal? PrecioAnterior { get; set; }
        public int Stock { get; set; }
        public string Imagen { get; set; }
        public bool Destacado { get; set; }
        public bool Activo { get; set; }
    }
}
