namespace Ombu.Negocio
{
    // Lo que se le muestra al cliente al volver del pago
    public class ResultadoPago
    {
        public string Estado { get; set; }
        public string Tipo { get; set; }
        public Guid Codigo { get; set; }
    }
}
