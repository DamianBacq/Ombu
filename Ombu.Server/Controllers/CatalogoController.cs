using Microsoft.AspNetCore.Mvc;
using Ombu.Entidades;
using Ombu.Negocio;

namespace Ombu.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CatalogoController : ControllerBase
    {
        private readonly CatalogoNegocio negocio = new CatalogoNegocio();

        [HttpGet("categorias")]
        public List<Categoria> Categorias()
        {
            return negocio.ListarCategorias();
        }

        [HttpGet("productos")]
        public List<Producto> Productos()
        {
            return negocio.ListarProductos(true);
        }

        [HttpGet("productos/{slug}")]
        public ActionResult<Producto> Producto(string slug)
        {
            Producto producto = negocio.ObtenerProducto(slug);
            if (producto == null) return NotFound();
            return producto;
        }
    }
}
