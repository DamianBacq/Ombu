using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Ombu.Entidades;
using Ombu.Negocio;

namespace Ombu.Server.Controllers
{
    // Todo lo del panel de la dueña necesita el token
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PanelController : ControllerBase
    {
        [HttpGet("resumen")]
        public Resumen Resumen()
        {
            return new ResumenNegocio().Obtener();
        }

        [HttpGet("pedidos")]
        public List<Pedido> Pedidos()
        {
            return new PedidoNegocio().Listar();
        }

        [HttpPut("pedidos/{id}/estado")]
        public ActionResult EstadoPedido(int id, [FromQuery] EstadoPedido estado)
        {
            try
            {
                new PedidoNegocio().CambiarEstado(id, estado);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET api/Panel/turnos?desde=2026-11-02 (trae 7 días)
        [HttpGet("turnos")]
        public List<Turno> Turnos(DateTime desde)
        {
            return new TurnoNegocio().ListarSemana(desde);
        }

        [HttpPut("turnos/{id}/{accion}")]
        public ActionResult AccionTurno(int id, string accion)
        {
            try
            {
                new TurnoNegocio().CambiarEstado(id, accion);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("productos")]
        public List<Producto> Productos()
        {
            return new CatalogoNegocio().ListarProductos(false);
        }

        [HttpPost("productos")]
        public ActionResult GuardarProducto(Producto producto)
        {
            try
            {
                new CatalogoNegocio().GuardarProducto(producto);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("tratamientos")]
        public List<Tratamiento> Tratamientos()
        {
            return new TratamientoNegocio().Listar(false);
        }

        [HttpPut("tratamientos")]
        public ActionResult GuardarTratamiento(Tratamiento tratamiento)
        {
            try
            {
                new TratamientoNegocio().Modificar(tratamiento);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("consultas")]
        public List<Consulta> Consultas()
        {
            return new ConsultaNegocio().Listar();
        }

        [HttpPut("consultas/{id}/leida")]
        public ActionResult MarcarLeida(int id)
        {
            new ConsultaNegocio().MarcarLeida(id);
            return Ok();
        }
    }
}
