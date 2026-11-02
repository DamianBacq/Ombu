using Microsoft.AspNetCore.Mvc;
using Ombu.Entidades;
using Ombu.Negocio;

namespace Ombu.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly PedidoNegocio negocio = new PedidoNegocio();

        [HttpPost]
        public ActionResult<Pedido> Crear(Pedido pedido)
        {
            try
            {
                return negocio.Crear(pedido);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{codigo}")]
        public ActionResult<Pedido> Obtener(Guid codigo)
        {
            Pedido pedido = negocio.ObtenerPorCodigo(codigo);
            if (pedido == null) return NotFound();
            return pedido;
        }
    }
}
