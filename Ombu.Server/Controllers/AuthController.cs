using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Ombu.Negocio;

namespace Ombu.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration configuracion;

        public AuthController(IConfiguration configuracion)
        {
            this.configuracion = configuracion;
        }

        public class Login
        {
            public string Usuario { get; set; }
            public string Password { get; set; }
        }

        [HttpPost("login")]
        public ActionResult Ingresar(Login login)
        {
            if (!new UsuarioNegocio().Validar(login.Usuario, login.Password)) return Unauthorized("Usuario o contraseña incorrectos.");

            SymmetricSecurityKey clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuracion["Jwt:Clave"]));
            JwtSecurityToken token = new JwtSecurityToken(
                claims: new[] { new Claim(ClaimTypes.Name, login.Usuario) },
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: new SigningCredentials(clave, SecurityAlgorithms.HmacSha256));
            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        }
    }
}
