namespace Ombu.Entidades
{
    public class Pago
    {
        public int Id { get; set; }
        public int? PedidoId { get; set; }
        public int? TurnoId { get; set; }
        public decimal Monto { get; set; }
        public EstadoPago Estado { get; set; }
        public string MpPagoId { get; set; }
        public DateTime Fecha { get; set; }
    }
}
