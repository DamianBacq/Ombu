using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ombu.Datos;
using Ombu.Negocio;

var builder = WebApplication.CreateBuilder(args);

// Configuración (en desarrollo, los valores reales van en los secretos de usuario)
Conexion.Cadena = builder.Configuration.GetConnectionString("Ombu");
Ajustes.MercadoPagoToken = builder.Configuration["MercadoPago:AccessToken"];
Ajustes.UrlBase = builder.Configuration["MercadoPago:UrlBase"];
Ajustes.UrlNotificacion = builder.Configuration["MercadoPago:UrlNotificacion"];

builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Clave"]))
        };
    });

var app = builder.Build();

new UsuarioNegocio().CrearInicial(builder.Configuration["Admin:Usuario"], builder.Configuration["Admin:Password"]);

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// En producción el mismo servidor entrega el frontend compilado
app.MapFallbackToFile("/index.html");

app.Run();
