using Ombu.Datos;
using Ombu.Entidades;

namespace Ombu.Negocio
{
    public class CatalogoNegocio
    {
        private readonly ProductoDatos productoDatos = new ProductoDatos();
        private readonly CategoriaDatos categoriaDatos = new CategoriaDatos();

        public List<Categoria> ListarCategorias()
        {
            return categoriaDatos.Listar();
        }

        public List<Producto> ListarProductos(bool soloActivos)
        {
            return productoDatos.Listar(soloActivos);
        }

        public Producto ObtenerProducto(string slug)
        {
            return productoDatos.ObtenerPorSlug(slug);
        }

        public void GuardarProducto(Producto producto)
        {
            if (string.IsNullOrWhiteSpace(producto.Nombre)) throw new Exception("El producto necesita un nombre.");
            if (producto.Precio <= 0) throw new Exception("El precio tiene que ser mayor a cero.");
            if (producto.Stock < 0) throw new Exception("El stock no puede ser negativo.");
            if (producto.PrecioAnterior != null && producto.PrecioAnterior <= producto.Precio) producto.PrecioAnterior = null;
            if (string.IsNullOrWhiteSpace(producto.Imagen)) producto.Imagen = "/img/p-giftcard.svg";
            producto.Resumen = producto.Resumen ?? "";
            producto.Descripcion = producto.Descripcion ?? "";
            producto.ModoUso = producto.ModoUso ?? "";
            producto.Contenido = producto.Contenido ?? "";
            producto.TipoPiel = producto.TipoPiel ?? "Todas";
            producto.Slug = CrearSlug(producto.Nombre);

            if (producto.Id == 0) productoDatos.Insertar(producto);
            else productoDatos.Modificar(producto);
        }

        // "Sérum vitamina C" -> "serum-vitamina-c"
        private string CrearSlug(string texto)
        {
            string normalizado = texto.ToLower().Trim()
                .Replace("á", "a").Replace("é", "e").Replace("í", "i").Replace("ó", "o").Replace("ú", "u").Replace("ñ", "n");
            string slug = "";
            foreach (char letra in normalizado)
            {
                if (char.IsLetterOrDigit(letra)) slug += letra;
                else if (!slug.EndsWith("-")) slug += "-";
            }
            return slug.Trim('-');
        }
    }
}
