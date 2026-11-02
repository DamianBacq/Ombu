using Microsoft.AspNetCore.Mvc;
using Ombu.Negocio;

namespace Ombu.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagosController : ControllerBase
    {
        private readonly PagoNegocio negocio = new PagoNegocio();

        [HttpGet("modo")]
        public ActionResult Modo()
        {
            return Ok(new { demo = Ajustes.ModoDemo });
        }

        [HttpPost("turno/{codigo}")]
        public async Task<ActionResult> PagarTurno(Guid codigo)
        {
            try
            {
                return Ok(new { url = await negocio.PagarTurno(codigo) });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("pedido/{codigo}")]
        public async Task<ActionResult> PagarPedido(Guid codigo)
        {
            try
            {
                return Ok(new { url = await negocio.PagarPedido(codigo) });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Al volver de Mercado Pago: GET api/Pagos/verificar?paymentId=...&externalReference=...
        [HttpGet("verificar")]
        public async Task<ActionResult<ResultadoPago>> Verificar(long? paymentId, int? externalReference)
        {
            try
            {
                if (paymentId != null) return await negocio.Verificar(paymentId.Value);
                if (externalReference != null) return negocio.Resultado(externalReference.Value);
                return BadRequest("Falta el pago.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Solo en modo demo
        [HttpPost("demo/{pagoId}")]
        public ActionResult<ResultadoPago> Demo(int pagoId, bool aprobado)
        {
            try
            {
                return negocio.ResolverDemo(pagoId, aprobado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("demo/{pagoId}")]
        public ActionResult DatosDemo(int pagoId)
        {
            try
            {
                return Ok(negocio.Resultado(pagoId));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Webhook de Mercado Pago. No se confía en el contenido: se consulta el pago real.
        [HttpPost("webhook")]
        public async Task<ActionResult> Webhook([FromQuery(Name = "data.id")] long? dataId, [FromQuery] string type)
        {
            try
            {
                if (type == "payment" && dataId != null) await negocio.Verificar(dataId.Value);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error en el webhook: " + ex.Message);
            }
            return Ok();
        }
    }
}
