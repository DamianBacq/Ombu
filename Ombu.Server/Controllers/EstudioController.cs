using Microsoft.AspNetCore.Mvc;
using Ombu.Entidades;
using Ombu.Negocio;

namespace Ombu.Server.Controllers
{
    // Datos públicos del estudio: tratamientos, profesionales y horarios
    [ApiController]
    [Route("api/[controller]")]
    public class EstudioController : ControllerBase
    {
        private readonly TratamientoNegocio tratamientoNegocio = new TratamientoNegocio();
        private readonly TurnoNegocio turnoNegocio = new TurnoNegocio();

        [HttpGet("tratamientos")]
        public List<Tratamiento> Tratamientos()
        {
            return tratamientoNegocio.Listar(true);
        }

        [HttpGet("tratamientos/{slug}")]
        public ActionResult<Tratamiento> Tratamiento(string slug)
        {
            Tratamiento tratamiento = tratamientoNegocio.ObtenerPorSlug(slug);
            if (tratamiento == null) return NotFound();
            return tratamiento;
        }

        [HttpGet("profesionales")]
        public List<Profesional> Profesionales()
        {
            return turnoNegocio.ListarProfesionales();
        }

        [HttpGet("horarios")]
        public List<HorarioAtencion> Horarios()
        {
            return turnoNegocio.ListarHorarios();
        }

        [HttpGet("dias")]
        public List<int> Dias()
        {
            return turnoNegocio.ListarDias();
        }
    }
}
