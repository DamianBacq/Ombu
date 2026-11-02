namespace Ombu.Entidades
{
    public class Pedido
    {
        public int Id { get; set; }
        public Cliente Cliente { get; set; }
        public Guid Codigo { get; set; }
        public EstadoPedido Estado { get; set; }
        public TipoEntrega Entrega { get; set; }
        public string Direccion { get; set; }
        public string Localidad { get; set; }
        public string CodigoPostal { get; set; }
        public decimal Subtotal { get; set; }
        public decimal CostoEnvio { get; set; }
        public decimal Total { get; set; }
        public DateTime Fecha { get; set; }
        public List<PedidoItem> Items { get; set; } = new List<PedidoItem>();
    }
}
