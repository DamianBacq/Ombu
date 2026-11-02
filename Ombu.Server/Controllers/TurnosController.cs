using Microsoft.AspNetCore.Mvc;
using Ombu.Entidades;
using Ombu.Negocio;

namespace Ombu.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TurnosController : ControllerBase
    {
        private readonly TurnoNegocio negocio = new TurnoNegocio();

        // GET api/Turnos/disponibilidad?fecha=2026-11-03&tratamientoId=1
        [HttpGet("disponibilidad")]
        public ActionResult<List<Horario>> Disponibilidad(DateTime fecha, int tratamientoId)
        {
            try
            {
                return negocio.Disponibilidad(fecha, tratamientoId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public ActionResult<Turno> Reservar(Turno turno)
        {
            try
            {
                return negocio.Reservar(turno);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{codigo}")]
        public ActionResult Obtener(Guid codigo)
        {
            Turno turno = negocio.ObtenerPorCodigo(codigo);
            if (turno == null) return NotFound();
            return Ok(new { turno, sePuedeCancelar = negocio.SePuedeCancelar(turno) });
        }

        [HttpPost("{codigo}/cancelar")]
        public ActionResult Cancelar(Guid codigo)
        {
            try
            {
                negocio.CancelarPorCliente(codigo);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
