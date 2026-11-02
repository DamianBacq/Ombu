namespace Ombu.Entidades
{
    // Datos del tablero del panel
    public class Resumen
    {
        public decimal VentasMes { get; set; }
        public decimal VentasMesAnterior { get; set; }
        public int PedidosMes { get; set; }
        public decimal TicketPromedio { get; set; }
        public int TurnosHoy { get; set; }
        public int TurnosSemana { get; set; }
        public int PedidosPorPreparar { get; set; }
        public int ConsultasSinLeer { get; set; }
        public List<VentaDia> VentasPorDia { get; set; } = new List<VentaDia>();
        public List<ProductoVendido> MasVendidos { get; set; } = new List<ProductoVendido>();
        public List<Producto> StockBajo { get; set; } = new List<Producto>();
    }

    public class VentaDia
    {
        public DateTime Fecha { get; set; }
        public decimal Tienda { get; set; }
        public decimal Estudio { get; set; }
    }

    public class ProductoVendido
    {
        public string Nombre { get; set; }
        public int Unidades { get; set; }
        public decimal Total { get; set; }
    }
}
