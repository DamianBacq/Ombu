namespace Ombu.Negocio
{
    // Se cargan en Program.cs desde appsettings o secretos
    public static class Ajustes
    {
        public static string MercadoPagoToken { get; set; }
        public static string UrlBase { get; set; }
        public static string UrlNotificacion { get; set; }

        // Sin token de Mercado Pago la página funciona en modo demo (pagos simulados)
        public static bool ModoDemo => string.IsNullOrWhiteSpace(MercadoPagoToken);

        // Hora actual de Argentina (nunca DateTime.Now)
        public static DateTime Ahora()
        {
            return TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "America/Argentina/Buenos_Aires");
        }
    }
}
